package swyp.paperdot.document.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import swyp.paperdot.api.callLLM.CallLLMService;
import swyp.paperdot.doc_units.docUnits.docUnitsEntity;
import swyp.paperdot.doc_units.docUnits.docUnitsRepository;
import swyp.paperdot.doc_units.enums.UnitStatus;
import swyp.paperdot.document.domain.DocumentContentSummary;
import swyp.paperdot.document.dto.DocumentContentSummaryResponse;
import swyp.paperdot.document.enums.SummaryStatus;
import swyp.paperdot.document.repository.DocumentContentSummaryRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentContentSummaryService {

    private static final String DISCLAIMER =
            "AI가 생성한 요약입니다. 시험·과제 인용 전 원문과 함께 확인해 주세요.";

    private static final String SUMMARY_SYSTEM_PROMPT = """
            You summarize English academic papers for Korean-speaking students.
            Output ONLY valid JSON with exactly these keys (values in Korean):
            {"topic":"...","method":"...","findings":"...","limitations":"..."}
            - topic: what the paper is about (2-3 sentences max)
            - method: approach or experiments (2-3 sentences max)
            - findings: main results (2-3 sentences max)
            - limitations: caveats or limits (1-2 sentences max)
            Do not invent facts not supported by the excerpt. If unclear, say so briefly in Korean.
            """;

    private final DocumentContentSummaryRepository summaryRepository;
    private final docUnitsRepository docUnitsRepository;
    private final CallLLMService callLLMService;
    private final ObjectMapper objectMapper;

    @Value("${document-summary.max-sentences:45}")
    private int maxSentences;

    @Value("${document-summary.max-chars:12000}")
    private int maxChars;

    @Value("${document-summary.min-sentences:5}")
    private int minSentences;

    @Transactional(readOnly = true)
    public DocumentContentSummaryResponse getSummary(Long documentId) {
        Optional<DocumentContentSummary> summary = summaryRepository.findByDocumentId(documentId);
        if (summary.isEmpty()) {
            return DocumentContentSummaryResponse.builder()
                    .status(null)
                    .disclaimer(DISCLAIMER)
                    .build();
        }
        return toResponse(summary.get());
    }

    /**
     * 번역 파이프라인 완료 후 호출. 실패해도 파이프라인 전체는 실패 처리하지 않음.
     */
    @Transactional
    public void generateAfterTranslation(Long documentId, boolean overwrite) {
        try {
            Optional<DocumentContentSummary> existing = summaryRepository.findByDocumentId(documentId);
            if (!overwrite && existing.isPresent() && existing.get().getStatus() == SummaryStatus.READY) {
                log.info("documentId {} - content summary already READY, skip.", documentId);
                return;
            }

            summaryRepository.deleteByDocumentId(documentId);
            summaryRepository.save(DocumentContentSummary.generating(documentId));

            String excerpt = buildExcerpt(documentId);
            if (!StringUtils.hasText(excerpt)) {
                markFailed(documentId, "요약할 본문이 충분하지 않습니다.");
                return;
            }

            String userPrompt = """
                    아래는 학술 PDF에서 추출한 앞부분 원문입니다. 논문 전체의 핵심만 요약해 주세요.

                    --- excerpt start ---
                    %s
                    --- excerpt end ---
                    """.formatted(excerpt);

            String raw = callLLMService.getChatResponseWithSystem(SUMMARY_SYSTEM_PROMPT, userPrompt);
            ParsedSummary parsed = parseSummaryJson(raw);
            markReady(documentId, parsed);
            log.info("documentId {} - content summary READY", documentId);

        } catch (Exception e) {
            log.error("documentId {} - content summary generation failed", documentId, e);
            markFailed(documentId, "요약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    private String buildExcerpt(Long documentId) {
        List<docUnitsEntity> units = docUnitsRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);
        List<String> texts = units.stream()
                .filter(u -> u.getStatus() == UnitStatus.TRANSLATED || u.getStatus() == UnitStatus.TRANSLATING)
                .map(docUnitsEntity::getSourceText)
                .filter(StringUtils::hasText)
                .limit(maxSentences)
                .collect(Collectors.toList());

        if (texts.size() < minSentences) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (String t : texts) {
            if (sb.length() + t.length() + 1 > maxChars) {
                break;
            }
            if (!sb.isEmpty()) {
                sb.append(' ');
            }
            sb.append(t.trim());
        }
        return sb.toString().trim();
    }

    private ParsedSummary parseSummaryJson(String raw) throws Exception {
        String json = extractJsonObject(raw);
        JsonNode node = objectMapper.readTree(json);
        return new ParsedSummary(
                textOrDefault(node, "topic"),
                textOrDefault(node, "method"),
                textOrDefault(node, "findings"),
                textOrDefault(node, "limitations")
        );
    }

    private static String extractJsonObject(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("empty LLM response");
        }
        String trimmed = raw.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private static String textOrDefault(JsonNode node, String field) {
        JsonNode val = node.get(field);
        if (val == null || val.isNull()) {
            return "정보가 충분하지 않습니다.";
        }
        String text = val.asText("").trim();
        return text.isEmpty() ? "정보가 충분하지 않습니다." : text;
    }

    @Transactional
    protected void markReady(Long documentId, ParsedSummary parsed) {
        DocumentContentSummary summary = summaryRepository.findByDocumentId(documentId)
                .orElseGet(() -> summaryRepository.save(DocumentContentSummary.generating(documentId)));
        summary.markReady(parsed.topic(), parsed.method(), parsed.findings(), parsed.limitations());
        summaryRepository.save(summary);
    }

    @Transactional
    protected void markFailed(Long documentId, String message) {
        DocumentContentSummary summary = summaryRepository.findByDocumentId(documentId)
                .orElseGet(() -> summaryRepository.save(DocumentContentSummary.generating(documentId)));
        summary.markFailed(message);
        summaryRepository.save(summary);
    }

    private DocumentContentSummaryResponse toResponse(DocumentContentSummary s) {
        return DocumentContentSummaryResponse.builder()
                .status(s.getStatus())
                .topic(s.getTopic())
                .method(s.getMethod())
                .findings(s.getFindings())
                .limitations(s.getLimitations())
                .errorMessage(s.getErrorMessage())
                .generatedAt(s.getGeneratedAt())
                .disclaimer(DISCLAIMER)
                .build();
    }

    private record ParsedSummary(String topic, String method, String findings, String limitations) {}
}

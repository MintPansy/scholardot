package swyp.scholardot.document.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swyp.scholardot.doc_units.docUnits.docUnitsEntity;
import swyp.scholardot.doc_units.docUnits.docUnitsRepository;
import swyp.scholardot.document.domain.DocumentAsset;
import swyp.scholardot.document.dto.DocumentAssetReferenceResponse;
import swyp.scholardot.document.dto.DocumentAssetResponse;
import swyp.scholardot.document.dto.DocumentAssetsBundleResponse;
import swyp.scholardot.document.enums.DocumentAssetKind;
import swyp.scholardot.document.repository.DocumentAssetRepository;
import swyp.scholardot.document.util.FigureTableExtractor;
import swyp.scholardot.document.util.FigureTableExtractor.ExtractedCaption;
import swyp.scholardot.document.util.FigureTableExtractor.TextMatch;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentAssetService {

    private final DocumentAssetRepository documentAssetRepository;
    private final docUnitsRepository docUnitsRepository;

    /**
     * 페이지 텍스트에서 Figure/Table 캡션을 추출해 document_assets에 저장한다.
     * overwrite=true이면 기존 자산을 교체한다.
     */
    @Transactional
    public List<DocumentAsset> extractAndSave(Long documentId, List<String> pageTexts, boolean overwrite) {
        if (documentId == null || pageTexts == null || pageTexts.isEmpty()) {
            return List.of();
        }

        List<ExtractedCaption> captions = FigureTableExtractor.extractCaptions(pageTexts);
        log.info("[assets] documentId={} captions found={}", documentId, captions.size());

        long existing = documentAssetRepository.countByDocumentId(documentId);
        if (!overwrite && existing > 0) {
            log.info("[assets] documentId={} skip extract (overwrite=false, existing={})", documentId, existing);
            return documentAssetRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);
        }

        if (existing > 0) {
            documentAssetRepository.deleteByDocumentId(documentId);
            documentAssetRepository.flush();
        }

        if (captions.isEmpty()) {
            return List.of();
        }

        List<DocumentAsset> entities = new ArrayList<>();
        int order = 0;
        for (ExtractedCaption caption : captions) {
            entities.add(DocumentAsset.builder()
                    .documentId(documentId)
                    .kind(caption.kind())
                    .number(caption.number())
                    .caption(caption.caption())
                    .sourcePage(caption.sourcePage())
                    .orderInDoc(order++)
                    .build());
        }
        return documentAssetRepository.saveAll(entities);
    }

    /**
     * 저장된 자산 + doc_units 본문 참조 매칭 결과를 반환한다.
     * 캡션 자산이 없는 참조는 UNMATCHED로 두고 assetId=null (보수적 연결).
     */
    @Transactional(readOnly = true)
    public DocumentAssetsBundleResponse getAssetsWithReferences(Long documentId) {
        List<DocumentAsset> assets = documentAssetRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);
        Map<String, DocumentAsset> byKey = new HashMap<>();
        for (DocumentAsset asset : assets) {
            byKey.put(assetKey(asset.getKind(), asset.getNumber()), asset);
        }

        List<DocumentAssetResponse> assetResponses = assets.stream()
                .map(this::toAssetResponse)
                .toList();

        List<DocumentAssetReferenceResponse> references = new ArrayList<>();
        List<docUnitsEntity> units = docUnitsRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);
        for (docUnitsEntity unit : units) {
            List<TextMatch> matches = FigureTableExtractor.findReferences(unit.getSourceText());
            for (TextMatch match : matches) {
                DocumentAsset linked = byKey.get(assetKey(match.kind(), match.number()));
                references.add(DocumentAssetReferenceResponse.builder()
                        .docUnitId(unit.getId())
                        .matchText(match.matchText())
                        .kind(match.kind())
                        .number(match.number())
                        .assetId(linked != null ? linked.getId() : null)
                        .sourcePage(linked != null ? linked.getSourcePage() : null)
                        .confidence(linked != null ? "MATCHED" : "UNMATCHED")
                        .build());
            }
        }

        return DocumentAssetsBundleResponse.builder()
                .assets(assetResponses)
                .references(references)
                .build();
    }

    @Transactional
    public void deleteByDocumentId(Long documentId) {
        documentAssetRepository.deleteByDocumentId(documentId);
    }

    private DocumentAssetResponse toAssetResponse(DocumentAsset asset) {
        return DocumentAssetResponse.builder()
                .id(asset.getId())
                .kind(asset.getKind())
                .number(asset.getNumber())
                .caption(asset.getCaption())
                .sourcePage(asset.getSourcePage())
                .orderInDoc(asset.getOrderInDoc())
                .build();
    }

    private static String assetKey(DocumentAssetKind kind, String number) {
        return kind.name() + ":" + number;
    }
}

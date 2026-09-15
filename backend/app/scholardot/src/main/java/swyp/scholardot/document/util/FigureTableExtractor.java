package swyp.scholardot.document.util;

import swyp.scholardot.document.enums.DocumentAssetKind;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PDF 페이지 텍스트에서 Figure/Table 캡션을 추출하고,
 * 본문 문장에서 참조 표현(Figure 1, Fig. 2, Table 3 등)을 식별한다.
 *
 * <p>v1은 정규식 기반 보수적 추출이다. 매칭 실패 시 자산을 만들지 않는다.
 */
public final class FigureTableExtractor {

    private FigureTableExtractor() {
    }

    /**
     * 캡션 후보: 줄 시작(또는 줄바꿈 직후)의 Figure/Fig./Table + 번호 + 선택적 캡션 본문.
     * PDFBox 줄바꿈이 깨진 경우를 위해 줄 중간 매칭도 허용하되, 번호 다음 구분자(.:-)가 있으면 우선한다.
     */
    private static final Pattern CAPTION_PATTERN = Pattern.compile(
            "(?im)(?:^|\\n)\\s*((?:Figure|Fig\\.?|TABLE|Table))\\s+(\\d+[A-Za-z]?)"
                    + "\\s*[:.\\-–—]?\\s*([^\\n]{0,300})"
    );

    /** 본문 참조: Figure/Fig./Table + 번호 (캡션보다 짧게, 단어 경계). */
    private static final Pattern BODY_REF_PATTERN = Pattern.compile(
            "(?i)\\b((?:Fig(?:ure)?\\.?|Table)\\s*\\d+[A-Za-z]?)\\b"
    );

    public record ExtractedCaption(
            DocumentAssetKind kind,
            String number,
            String caption,
            int sourcePage
    ) {
    }

    public record TextMatch(
            DocumentAssetKind kind,
            String number,
            String matchText,
            int start,
            int end
    ) {
    }

    /**
     * 페이지별 텍스트에서 캡션을 추출한다. 동일 (kind, number)는 첫 등장만 유지한다.
     */
    public static List<ExtractedCaption> extractCaptions(List<String> pageTexts) {
        Map<String, ExtractedCaption> byKey = new LinkedHashMap<>();
        if (pageTexts == null) {
            return List.of();
        }

        for (int i = 0; i < pageTexts.size(); i++) {
            String pageText = pageTexts.get(i);
            if (pageText == null || pageText.isBlank()) {
                continue;
            }
            int pageNum = i + 1;
            Matcher matcher = CAPTION_PATTERN.matcher(pageText);
            while (matcher.find()) {
                DocumentAssetKind kind = parseKind(matcher.group(1));
                if (kind == null) {
                    continue;
                }
                String number = normalizeNumber(matcher.group(2));
                if (number.isEmpty()) {
                    continue;
                }
                String caption = normalizeCaption(matcher.group(3));
                String key = kind.name() + ":" + number;
                byKey.putIfAbsent(key, new ExtractedCaption(kind, number, caption, pageNum));
            }
        }
        return new ArrayList<>(byKey.values());
    }

    /** 단일 문장(또는 단락)에서 Figure/Table 참조를 모두 찾는다. */
    public static List<TextMatch> findReferences(String text) {
        List<TextMatch> matches = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return matches;
        }

        Matcher matcher = BODY_REF_PATTERN.matcher(text);
        while (matcher.find()) {
            String raw = matcher.group(1);
            ParsedRef parsed = parseReference(raw);
            if (parsed == null) {
                continue;
            }
            matches.add(new TextMatch(
                    parsed.kind(),
                    parsed.number(),
                    raw,
                    matcher.start(1),
                    matcher.end(1)
            ));
        }
        return matches;
    }

    static DocumentAssetKind parseKind(String token) {
        if (token == null) {
            return null;
        }
        String t = token.trim().toLowerCase(Locale.ROOT).replace(".", "");
        if (t.startsWith("fig")) {
            return DocumentAssetKind.FIGURE;
        }
        if (t.startsWith("table")) {
            return DocumentAssetKind.TABLE;
        }
        return null;
    }

    static String normalizeNumber(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "");
    }

    static String normalizeCaption(String raw) {
        if (raw == null) {
            return "";
        }
        String trimmed = raw.trim().replaceAll("\\s+", " ");
        // 캡션이 다음 문장까지 이어진 경우 첫 문장만 유지
        int cut = indexOfSentenceEnd(trimmed);
        if (cut > 20) {
            trimmed = trimmed.substring(0, cut + 1).trim();
        }
        return trimmed;
    }

    private static int indexOfSentenceEnd(String s) {
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '.' || c == '!' || c == '?') {
                if (i + 1 >= s.length() || Character.isWhitespace(s.charAt(i + 1))) {
                    return i;
                }
            }
        }
        return -1;
    }

    private record ParsedRef(DocumentAssetKind kind, String number) {
    }

    private static ParsedRef parseReference(String raw) {
        if (raw == null) {
            return null;
        }
        Matcher m = Pattern.compile("(?i)^(Fig(?:ure)?\\.?|Table)\\s*(\\d+[A-Za-z]?)$")
                .matcher(raw.trim());
        if (!m.find()) {
            return null;
        }
        DocumentAssetKind kind = parseKind(m.group(1));
        String number = normalizeNumber(m.group(2));
        if (kind == null || number.isEmpty()) {
            return null;
        }
        return new ParsedRef(kind, number);
    }
}

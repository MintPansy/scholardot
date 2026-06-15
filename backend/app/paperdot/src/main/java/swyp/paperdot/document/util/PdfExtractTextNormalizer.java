package swyp.paperdot.document.util;

import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PDF 추출 텍스트의 비정상 띄어쓰기(PD F, Sentence- BERT 등)를 번역·저장 전에 보정합니다.
 */
public final class PdfExtractTextNormalizer {

    private static final List<String[]> PHRASE_FIXES = List.of(
            new String[]{"Schol arDot", "ScholarDot"},
            new String[]{"Scholar Dot", "ScholarDot"},
            new String[]{"Sentence- BERT", "Sentence-BERT"},
            new String[]{"FA ISS", "FAISS"},
            new String[]{"BER T", "BERT"},
            new String[]{"PD F", "PDF"},
            new String[]{"GP T", "GPT"},
            new String[]{"NL P", "NLP"},
            new String[]{"Sci QA", "SciQA"},
            new String[]{"Bio ASQ", "BioASQ"},
            new String[]{"Long Former", "LongFormer"},
            new String[]{"Open AI", "OpenAI"},
            new String[]{"GPT- 4o", "GPT-4o"},
            new String[]{"GPT- 4", "GPT-4"}
    ).stream()
            .sorted(Comparator.comparing((String[] p) -> p[0]).reversed())
            .toList();

    private static final Pattern BROKEN_ACRONYM =
            Pattern.compile("\\b([A-Z]{2,})\\s+([A-Z])(?=\\s|[,.;:!?)\\]\\-]|$)");
    private static final Pattern HYPHEN_GAP =
            Pattern.compile("([A-Za-z0-9])-\\s+([A-Z][A-Za-z0-9]*)");
    private static final Pattern DIGIT_LETTER =
            Pattern.compile("(\\d)\\s+([a-z])(?=\\s|[,.;:!?)\\]]|$)");

    private PdfExtractTextNormalizer() {
    }

    public static String normalize(String text) {
        if (text == null || text.isBlank() || !text.matches(".*[A-Za-z].*")) {
            return text;
        }

        String out = text;
        out = applyPhraseFixes(out);
        out = mergeBrokenAcronyms(out);
        out = HYPHEN_GAP.matcher(out).replaceAll("$1-$2");
        out = DIGIT_LETTER.matcher(out).replaceAll("$1$2");
        out = applyPhraseFixes(out);
        return out;
    }

    private static String applyPhraseFixes(String text) {
        String out = text;
        for (String[] pair : PHRASE_FIXES) {
            if (out.contains(pair[0])) {
                out = out.replace(pair[0], pair[1]);
            }
        }
        return out;
    }

    private static String mergeBrokenAcronyms(String text) {
        String out = text;
        for (int i = 0; i < 6; i++) {
            Matcher m = BROKEN_ACRONYM.matcher(out);
            if (!m.find()) {
                break;
            }
            out = m.replaceAll("$1$2");
        }
        return out;
    }
}

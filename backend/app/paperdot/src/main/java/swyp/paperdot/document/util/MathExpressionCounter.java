package swyp.paperdot.document.util;

import java.util.regex.Pattern;

/**
 * {@code frontend/app/components/read/mathSegments.ts} 의 splitMathSegments 와 동일한 규칙으로
 * 수식 구간 개수를 셉니다 (KaTeX 렌더 경로와 정합).
 * <p>
 * PDF 텍스트 추출 결과는 구분자 없이 유니코드만 남는 경우가 많아,
 * {@link #countMathForStructureAnalysis(String)} 에서 LaTeX 구간 + 평문 수식 후보를 함께 집계합니다.
 */
public final class MathExpressionCounter {

    private static final Pattern CJK = Pattern.compile("[\\uAC00-\\uD7A3\\u4E00-\\u9FFF\\u3040-\\u30FF]");

    /** 강한 수학 기호(하나라도 있으면 수식 후보) */
    private static final Pattern STRONG_MATH_SYMBOL = Pattern.compile(
            "[∑∫∏√∂∇∮∬∭⨀⨁⨂⊕⊗⊤⊥∞∝≈≡≠≤≥⟨⟩〈〉⌊⌋⌈⌉∈∉⊂⊃∪∩∀∃]"
    );

    /** LaTeX 조각이 텍스트로 남은 경우 */
    private static final Pattern LATEX_FRAGMENT = Pattern.compile(
            "\\\\(sum|int|frac|sqrt|prod|partial|infty|alpha|beta|gamma|delta|lambda|mu|pi|psi|sigma|theta|omega|cdot|times|leq|geq|neq|approx|equiv)"
    );

    /** 그리스 소문자 (일반 학술 수식, Greek and Coptic 블록) */
    private static final Pattern GREEK_LOWER = Pattern.compile("[\\u03B1-\\u03C9]");

    private MathExpressionCounter() {
    }

    /**
     * 문서 구조 분석용: LaTeX 구분자 기반 구간 수 + (없을 때) 평문 수식 후보 1회/문장 단위.
     * 완전한 구분이 아니라 “수식이 섞인 문장” 존재 여부를 반영합니다.
     */
    public static int countMathForStructureAnalysis(String input) {
        if (input == null || input.isEmpty()) {
            return 0;
        }
        int latexSpans = countMathSpans(input);
        if (latexSpans > 0) {
            return latexSpans;
        }
        return looksLikePlainTextMath(input) ? 1 : 0;
    }

    /**
     * PDF 추출 본문에서 LaTeX 없이 남은 수식 흔적을 느슨하게 탐지합니다.
     */
    static boolean looksLikePlainTextMath(String s) {
        if (s == null) {
            return false;
        }
        String t = s.trim();
        if (t.length() < 2) {
            return false;
        }
        if (STRONG_MATH_SYMBOL.matcher(t).find()) {
            return true;
        }
        if (LATEX_FRAGMENT.matcher(t).find()) {
            return true;
        }
        if (GREEK_LOWER.matcher(t).find()) {
            return true;
        }
        // 아래 문자 중 2종 이상 + (숫자 또는 괄호) — 일반 문장과 구분
        int cat = 0;
        if (t.indexOf('=') >= 0) {
            cat++;
        }
        if (t.indexOf('^') >= 0 || t.indexOf('_') >= 0) {
            cat++;
        }
        if (indexOfAny(t, "+-*/") >= 0 || t.indexOf('−') >= 0 || t.indexOf('·') >= 0 || t.indexOf('×') >= 0) {
            cat++;
        }
        if (t.indexOf('π') >= 0 || t.indexOf('ψ') >= 0 || t.indexOf('λ') >= 0) {
            cat++;
        }
        if (t.indexOf('≤') >= 0 || t.indexOf('≥') >= 0) {
            cat++;
        }
        boolean hasDigit = false;
        for (int i = 0; i < t.length(); i++) {
            if (Character.isDigit(t.charAt(i))) {
                hasDigit = true;
                break;
            }
        }
        boolean hasParen = t.indexOf('(') >= 0 || t.indexOf('[') >= 0;
        if (cat >= 2 && (hasDigit || hasParen)) {
            return true;
        }
        // 짧은 조각에 연산자·기호 밀도
        int opLike = 0;
        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            if ("=+-*/^_".indexOf(c) >= 0) {
                opLike++;
            }
        }
        return t.length() <= 280 && opLike >= 3 && hasDigit;
    }

    private static int indexOfAny(String s, String chars) {
        for (int i = 0; i < s.length(); i++) {
            if (chars.indexOf(s.charAt(i)) >= 0) {
                return i;
            }
        }
        return -1;
    }

    public static int countMathSpans(String input) {
        if (input == null || input.isEmpty()) {
            return 0;
        }
        int count = 0;
        int pos = 0;
        while (pos < input.length()) {
            MathStart next = findNextMathStart(input, pos);
            if (next == null) {
                break;
            }
            if (next.index > pos) {
                // text before math — skip
            }
            int end;
            String inner;
            if ("dd".equals(next.mode)) {
                int close = input.indexOf("$$", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else if ("br".equals(next.mode)) {
                int close = input.indexOf("\\]", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else if ("pr".equals(next.mode)) {
                int close = input.indexOf("\\)", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else {
                int close = findClosingSingleDollar(input, next.index + 1);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 1, close);
                end = close + 1;
            }

            String trimmed = inner.trim();
            if (trimmed.isEmpty()) {
                pos = end;
                continue;
            }
            if (CJK.matcher(trimmed).find()) {
                pos = end;
                continue;
            }
            count++;
            pos = end;
        }
        return count;
    }

    private record MathStart(int index, String mode) {
    }

    private static int findClosingSingleDollar(String s, int from) {
        int i = from;
        while (i < s.length()) {
            int j = s.indexOf('$', i);
            if (j < 0) {
                return -1;
            }
            if (j + 1 < s.length() && s.charAt(j + 1) == '$') {
                i = j + 2;
                continue;
            }
            return j;
        }
        return -1;
    }

    private static MathStart findNextMathStart(String s, int pos) {
        MathStart best = null;

        int iDd = s.indexOf("$$", pos);
        if (iDd >= 0) {
            best = new MathStart(iDd, "dd");
        }

        int iBr = s.indexOf("\\[", pos);
        if (iBr >= 0 && (best == null || iBr < best.index)) {
            best = new MathStart(iBr, "br");
        }

        int iPr = s.indexOf("\\(", pos);
        if (iPr >= 0 && (best == null || iPr < best.index)) {
            best = new MathStart(iPr, "pr");
        }

        int i = pos;
        while (i < s.length()) {
            if (s.charAt(i) != '$') {
                i++;
                continue;
            }
            if (i + 1 < s.length() && s.charAt(i + 1) == '$') {
                i += 2;
                continue;
            }
            if (best == null || i < best.index) {
                best = new MathStart(i, "sd");
            }
            break;
        }

        return best;
    }
}

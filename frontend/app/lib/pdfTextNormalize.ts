/**
 * PDF 텍스트 추출·표시 과정에서 흔한 비정상 띄어쓰기를 보정합니다.
 * - PD F → PDF, Sentence- BERT → Sentence-BERT
 * - fixLineText 등 후처리로 생긴 Scholar Dot → ScholarDot
 *
 * 주의: 일반 영어 띄어쓰기(A model 등)는 건드리지 않습니다.
 */

/** 긴 키부터 치환 (부분 매칭 방지) */
const PHRASE_FIXES: readonly [string, string][] = [
  ["Schol arDot", "ScholarDot"],
  ["Scholar Dot", "ScholarDot"],
  ["Sentence- BERT", "Sentence-BERT"],
  ["FA ISS", "FAISS"],
  ["BER T", "BERT"],
  ["PD F", "PDF"],
  ["GP T", "GPT"],
  ["NL P", "NLP"],
  ["Sci QA", "SciQA"],
  ["Bio ASQ", "BioASQ"],
  ["Long Former", "LongFormer"],
  ["Open AI", "OpenAI"],
  ["GPT- 4o", "GPT-4o"],
  ["GPT- 4", "GPT-4"],
].sort((a, b) => b[0].length - a[0].length);

/** 연속 대문자 약어: PD F → PDF (2회 이상 반복 적용) */
const BROKEN_ACRONYM_RE = /\b([A-Z]{2,})\s+([A-Z])(?=\s|[,.;:!?)\]\-]|$)/g;

/** 하이픈 뒤 공백: Sentence- BERT */
const HYPHEN_GAP_RE = /([A-Za-z0-9])-\s+([A-Z][A-Za-z0-9]*)/g;

/** 숫자·대문자 약어: 4 o → 4o (GPT-4o 등) — 숫자 바로 뒤 단일 소문자만 */
const DIGIT_LETTER_RE = /(\d)\s+([a-z])(?=\s|[,.;:!?)\]]|$)/g;

function applyPhraseFixes(text: string): string {
  let out = text;
  for (const [broken, fixed] of PHRASE_FIXES) {
    if (out.includes(broken)) {
      out = out.split(broken).join(fixed);
    }
  }
  return out;
}

function mergeBrokenAcronyms(text: string): string {
  let out = text;
  for (let i = 0; i < 6; i += 1) {
    const next = out.replace(BROKEN_ACRONYM_RE, "$1$2");
    if (next === out) break;
    out = next;
  }
  return out;
}

export function normalizePdfExtractText(text: string): string {
  if (!text || !/[A-Za-z]/.test(text)) return text;

  let out = text;
  out = applyPhraseFixes(out);
  out = mergeBrokenAcronyms(out);
  out = out.replace(HYPHEN_GAP_RE, "$1-$2");
  out = out.replace(DIGIT_LETTER_RE, "$1$2");
  out = applyPhraseFixes(out);
  return out;
}

/**
 * Read 화면용 mock 데이터.
 * sessionStorage에 번역 데이터가 없을 때(직접 /read 진입 등) 사용합니다.
 */

export interface MockTranslationPair {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
}

export const MOCK_FILE_NAME = "sample-paper.pdf";

export const MOCK_TRANSLATION_PAIRS: MockTranslationPair[] = [
  {
    docUnitId: 1,
    sourceText:
      "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience.",
    translatedText:
      "머신러닝은 시스템이 경험으로부터 학습하고 개선할 수 있게 하는 인공지능의 하위 분야입니다.",
  },
  {
    docUnitId: 2,
    sourceText:
      "Neural networks are inspired by the structure of the human brain.",
    translatedText: "신경망은 인간 뇌의 구조에서 영감을 받았습니다.",
  },
  {
    docUnitId: 3,
    sourceText:
      "Deep learning uses multiple layers to progressively extract higher-level features from raw input.",
    translatedText:
      "딥러닝은 여러 계층을 사용해 원시 입력에서 더 높은 수준의 특징을 점진적으로 추출합니다.",
  },
  {
    docUnitId: 4,
    sourceText:
      "Natural language processing has made significant progress in recent years.",
    translatedText: "자연어 처리는 최근 몇 년 사이 큰 진전을 이루었습니다.",
  },
  {
    docUnitId: 5,
    sourceText:
      "Transformer architecture has become the foundation for many state-of-the-art models.",
    translatedText:
      "트랜스포머 아키텍처는 많은 최신 모델의 기반이 되었습니다.",
  },
  {
    docUnitId: 6,
    sourceText:
      "Researchers are exploring ways to make AI systems more interpretable and trustworthy.",
    translatedText:
      "연구자들은 AI 시스템을 더 해석 가능하고 신뢰할 수 있게 만드는 방법을 탐구하고 있습니다.",
  },
  {
    docUnitId: 7,
    sourceText:
      "Ethical considerations in AI development are gaining increased attention.",
    translatedText: "AI 개발에서의 윤리적 고려사항이 더 많은 주목을 받고 있습니다.",
  },
  {
    docUnitId: 8,
    sourceText:
      "This paper presents a novel approach to document understanding.",
    translatedText: "본 논문은 문서 이해에 대한 새로운 접근법을 제시합니다.",
  },
  {
    docUnitId: 9,
    sourceText:
      "We evaluate our method on three benchmark datasets and report competitive results.",
    translatedText:
      "세 가지 벤치마크 데이터셋에서 우리의 방법을 평가하고 경쟁력 있는 결과를 보고합니다.",
  },
  {
    docUnitId: 10,
    sourceText:
      "Future work will focus on extending the framework to multimodal inputs.",
    translatedText:
      "향후 연구는 프레임워크를 다중 모달 입력으로 확장하는 데 집중할 것입니다.",
  },
];

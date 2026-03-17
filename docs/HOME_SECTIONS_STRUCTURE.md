# 홈 화면 섹션 구조 제안

## 1. Hero
```
<section>
  <div> (container: max-w-6xl mx-auto px-8 py-24)
    <h1> 영어 논문을 '노트처럼' 읽으세요 </h1>
    <p> (서브문구) 문장 단위 번역으로 원문과 함께 끊김 없이 읽을 수 있습니다. </p>
    <div> (버튼 2개: flex gap-4)
      <Link> 지금 시작하기 (primary)
      <Link> 자세히 보기 (secondary/outline)
</section>
```

## 2. 문제-해결 (Problem-Solution)
```
<section>
  <div> (container)
    <h2> 왜 ScholarDot인가요? </h2>
    <div> (2-col grid: lg:grid-cols-2 gap-12)
      <div> (왼쪽: 문제 3개)
        <h3> 이런 고민 있으신가요? </h3>
        <ul>
          <li> 문제 1
          <li> 문제 2
          <li> 문제 3
      <div> (오른쪽: 해결 3개)
        <h3> ScholarDot이 해결해요 </h3>
        <ul>
          <li> 해결 1
          <li> 해결 2
          <li> 해결 3
</section>
```

## 3. 기능 3블록 (Features)
```
<section>
  <div> (container)
    <h2> 핵심 기능 </h2>
    <div> (grid grid-cols-1 md:grid-cols-3 gap-8)
      <div> (카드 1)
        <div> (아이콘/이미지 영역)
        <h3> 문장 병렬
        <p> 설명
      <div> (카드 2)
        <h3> PDF 네비
        <p> 설명
      <div> (카드 3)
        <h3> 내 문서함
        <p> 설명
</section>
```

## 4. 데모 (Demo)
```
<section>
  <div> (container)
    <h2> 실제 리더 화면 </h2>
    <div> (flex 또는 grid: 이미지 + 텍스트)
      <div> (이미지 래퍼, aspect-video 또는 비율 지정)
        <Image> (리더 화면 스크린샷)
      <div> (설명)
        <p> 문장별 한·영 병렬, 페이지 네비게이션...
</section>
```

## 5. CTA (Call to Action)
```
<section>
  <div> (container, 배경색 강조)
    <h2> 지금 시작하세요 </h2>
    <p> 논문 읽기가 한층 쉬워집니다. </p>
    <Link> 지금 시작하기
</section>
```

---

## 컨텐츠 초안

| 섹션 | 메인 텍스트 | 상세 |
|------|-------------|------|
| Hero | 영어 논문을 '노트처럼' 읽으세요 | 서브: 문장 단위 번역으로 원문과 함께 끊김 없이 |
| 문제 | 번역기 왔다갔다 / 문서 위치 찾기 힘듦 / 저장 안 됨 | |
| 해결 | 문장 병렬 표시 / PDF 네비로 즉시 이동 / 내 문서함 자동 저장 | |
| 기능1 | 문장 병렬 | 원문과 번역을 한 줄씩 나란히 |
| 기능2 | PDF 네비 | 페이지 썸네일로 원하는 위치로 바로 점프 |
| 기능3 | 내 문서함 | 업로드한 문서 저장·관리 |
| 데모 | 실제 리더 화면 | 스크린샷 + 설명 |
| CTA | 지금 시작하세요 | 논문 읽기가 한층 쉬워집니다 |

"""
실험 1: 페이지 수별 번역 파이프라인 완료 시간 측정
결과: experiment/results_pipeline.csv
"""
import requests
import time
import csv
import os
import sys

BASE = "http://localhost:8080"
POLL_INTERVAL = 3   # 초마다 진행률 폴링
TIMEOUT = 600       # 최대 대기 10분
TRIALS = 3          # PDF당 반복 횟수
OWNER_ID = 1        # 실험용 더미 ownerId


def upload_pdf(pdf_path: str, title: str) -> int:
    """PDF 업로드 → documentId 반환"""
    with open(pdf_path, "rb") as f:
        res = requests.post(
            f"{BASE}/documents",
            data={
                "ownerId": OWNER_ID,
                "title": title,
                "languageSrc": "en",
                "languageTgt": "ko",
            },
            files={"file": (os.path.basename(pdf_path), f, "application/pdf")},
            timeout=60,
        )
    res.raise_for_status()
    doc_id = res.json()["documentId"]
    print(f"  업로드 완료 → documentId={doc_id}")
    return doc_id


def start_pipeline(doc_id: int) -> None:
    """번역 파이프라인 시작"""
    res = requests.post(
        f"{BASE}/api/v1/documents/{doc_id}/process",
        timeout=30,
    )
    res.raise_for_status()


def poll_until_done(doc_id: int) -> tuple[float, int]:
    """번역 완료까지 폴링 → (소요 초, 총 문장 수) 반환"""
    start = time.time()
    deadline = start + TIMEOUT
    while time.time() < deadline:
        time.sleep(POLL_INTERVAL)
        res = requests.get(
            f"{BASE}/api/v1/documents/{doc_id}/translation-progress",
            timeout=15,
        )
        res.raise_for_status()
        p = res.json()
        total = p.get("total", 0)
        translated = p.get("translated", 0)
        failed = p.get("failed", 0)
        elapsed = round(time.time() - start, 1)
        print(f"    [{elapsed}s] total={total} translated={translated} failed={failed}")

        if total > 0 and (translated + failed) >= total:
            return round(time.time() - start, 2), total

    raise TimeoutError(f"문서 {doc_id} 번역이 {TIMEOUT}초 내에 완료되지 않음")


def measure(pdf_path: str, pages: int) -> list[dict]:
    rows = []
    for trial in range(1, TRIALS + 1):
        print(f"\n[{os.path.basename(pdf_path)}] {pages}p trial {trial}/{TRIALS}")
        doc_id = upload_pdf(pdf_path, f"exp_{pages}p_t{trial}")
        start_pipeline(doc_id)
        elapsed, total_sentences = poll_until_done(doc_id)
        print(f"  완료: {elapsed}s / 문장수={total_sentences}")
        rows.append({
            "pdf": os.path.basename(pdf_path),
            "pages": pages,
            "trial": trial,
            "elapsed_sec": elapsed,
            "total_sentences": total_sentences,
        })
    return rows


def main():
    # pdfs/ 폴더에서 PDF 목록 자동 감지
    pdf_dir = os.path.join(os.path.dirname(__file__), "pdfs")
    pdfs = sorted(f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf"))

    if not pdfs:
        print("[오류] experiment/pdfs/ 폴더에 PDF 파일을 넣어주세요.")
        print("  파일명 권장: 01page.pdf, 03page.pdf, 05page.pdf, 10page.pdf")
        sys.exit(1)

    print(f"발견된 PDF: {pdfs}")

    all_rows = []
    for pdf_name in pdfs:
        # 파일명에서 페이지 수 추출 시도 (예: 03page.pdf → 3)
        try:
            pages = int("".join(filter(str.isdigit, pdf_name.split("page")[0])))
        except Exception:
            pages = 0  # 추출 실패 시 0으로 기록

        pdf_path = os.path.join(pdf_dir, pdf_name)
        all_rows.extend(measure(pdf_path, pages))

    # CSV 저장
    out_path = os.path.join(os.path.dirname(__file__), "results_pipeline.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["pdf", "pages", "trial", "elapsed_sec", "total_sentences"])
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\n결과 저장 완료: {out_path}")
    print("\n[요약]")
    from collections import defaultdict
    import statistics
    by_pages = defaultdict(list)
    for r in all_rows:
        by_pages[r["pages"]].append(r["elapsed_sec"])
    for pages, times in sorted(by_pages.items()):
        print(f"  {pages}p: 평균 {statistics.mean(times):.1f}s, 최소 {min(times):.1f}s, 최대 {max(times):.1f}s")


if __name__ == "__main__":
    main()

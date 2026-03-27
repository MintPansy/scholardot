"""
실험 2: 주요 API 엔드포인트 응답 시간 측정
사전 조건: measure_pipeline.py 실행 후 번역 완료된 문서 ID를 DOC_ID에 입력
결과: experiment/results_latency.csv
"""
import requests
import time
import csv
import statistics
import os

BASE = "http://localhost:8080"
TRIALS = 10  # 각 엔드포인트 10회 측정

# measure_pipeline.py 실행 후 results_pipeline.csv에서 docId 확인하거나
# 직접 입력 (번역 완료된 문서 ID)
DOC_ID = None  # 예: DOC_ID = 5


def measure_endpoint(name: str, url: str, method: str = "GET", **kwargs) -> dict:
    times_ms = []
    errors = 0
    for _ in range(TRIALS):
        try:
            t = time.perf_counter()
            if method == "GET":
                res = requests.get(url, timeout=15, **kwargs)
            else:
                res = requests.post(url, timeout=15, **kwargs)
            elapsed_ms = (time.perf_counter() - t) * 1000
            if res.status_code < 500:
                times_ms.append(elapsed_ms)
            else:
                errors += 1
        except Exception as e:
            errors += 1
            print(f"  오류: {e}")

    if not times_ms:
        print(f"  [{name}] 측정 실패 (모두 오류)")
        return {"endpoint": name, "url": url, "trials": TRIALS, "success": 0,
                "avg_ms": None, "min_ms": None, "max_ms": None, "p95_ms": None}

    p95 = sorted(times_ms)[int(len(times_ms) * 0.95) - 1] if len(times_ms) >= 2 else times_ms[-1]
    result = {
        "endpoint": name,
        "url": url,
        "trials": TRIALS,
        "success": len(times_ms),
        "avg_ms": round(statistics.mean(times_ms), 1),
        "min_ms": round(min(times_ms), 1),
        "max_ms": round(max(times_ms), 1),
        "p95_ms": round(p95, 1),
    }
    print(f"  [{name}] 평균={result['avg_ms']}ms, 최대={result['max_ms']}ms, p95={result['p95_ms']}ms")
    return result


def main():
    if DOC_ID is None:
        print("[안내] DOC_ID를 설정해주세요.")
        print("  measure_pipeline.py 실행 후 results_pipeline.csv 참고")
        print("  또는 브라우저에서 번역 완료한 문서의 ID를 확인 후 이 파일 상단 DOC_ID에 입력")
        return

    endpoints = [
        ("번역 진행률 조회",   f"{BASE}/api/v1/documents/{DOC_ID}/translation-progress"),
        ("번역 쌍 조회",       f"{BASE}/api/v1/documents/{DOC_ID}/translation-pairs"),
        ("번역 기록 목록",     f"{BASE}/api/v1/documents/translation-histories", ),
    ]

    print(f"측정 시작 (DOC_ID={DOC_ID}, 각 {TRIALS}회)\n")
    rows = []
    for name, url in endpoints:
        params = {}
        if "histories" in url:
            params = {"ownerId": 1}
        rows.append(measure_endpoint(name, url, params=params))

    # CSV 저장
    out_path = os.path.join(os.path.dirname(__file__), "results_latency.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["endpoint", "url", "trials", "success", "avg_ms", "min_ms", "max_ms", "p95_ms"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n결과 저장: {out_path}")


if __name__ == "__main__":
    main()

"use client";

import { useState } from "react";
import styles from "./DocumentContentSummaryPanel.module.css";
import type { DocumentContentSummary } from "@/app/services/document";

type Props = {
  data: DocumentContentSummary | null;
  loading: boolean;
  error: string | null;
};

const ROWS: { key: keyof Pick<DocumentContentSummary, "topic" | "method" | "findings" | "limitations">; label: string }[] = [
  { key: "topic", label: "주제" },
  { key: "method", label: "방법" },
  { key: "findings", label: "결과" },
  { key: "limitations", label: "한계" },
];

export default function DocumentContentSummaryPanel({ data, loading, error }: Props) {
  const [open, setOpen] = useState(true);

  if (loading && !data) {
    return (
      <section className={styles.wrap} aria-busy="true">
        <div className={styles.inner}>
          <p className={styles.loadingText}>논문 개요를 불러오는 중…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrap}>
        <div className={styles.inner}>
          <p className={styles.errorText} role="status">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!data || data.status === "NONE") {
    return null;
  }

  const isGenerating = data.status === "GENERATING";
  const isFailed = data.status === "FAILED";
  const isReady = data.status === "READY";

  return (
    <section className={styles.wrap} aria-label="논문 개요">
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.toggleBtn}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleTitle}>이 논문 한눈에</span>
          <span className={styles.toggleHint}>
            {isGenerating && "요약 생성 중…"}
            {isFailed && "요약 실패"}
            {isReady && "AI 개요 · 원문과 함께 확인"}
          </span>
          <span className={styles.chevron} data-open={open}>
            ▾
          </span>
        </button>

        {open && (
          <div className={styles.panel}>
            {isGenerating && (
              <p className={styles.generatingText}>
                번역이 끝난 뒤 논문 앞부분을 바탕으로 개요를 만들고 있습니다…
              </p>
            )}

            {isFailed && (
              <p className={styles.errorText} role="status">
                {data.errorMessage ?? "요약을 가져오지 못했습니다."}
              </p>
            )}

            {isReady && (
              <dl className={styles.grid}>
                {ROWS.map(({ key, label }) => (
                  <div key={key} className={styles.row}>
                    <dt className={styles.label}>{label}</dt>
                    <dd className={styles.value}>{data[key]}</dd>
                  </div>
                ))}
              </dl>
            )}

            {data.disclaimer && (
              <p className={styles.disclaimer}>{data.disclaimer}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

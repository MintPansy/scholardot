"use client";

import styles from "./DocumentAnalysisSummary.module.css";
import type {
  DocumentStructureAnalysis,
} from "@/app/services/document";

function formatInt(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n));
}

function formatFixed(n: number, digits = 1): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

type Props = {
  data: DocumentStructureAnalysis | null;
  loading: boolean;
  error: string | null;
};

export default function DocumentAnalysisSummary({
  data,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <section className={styles.section} aria-busy="true">
        <h2 className={styles.sectionTitle}>문서 분석 요약</h2>
        <div className={styles.loadingRow}>
          <span className={styles.spinner} aria-hidden />
          <span className={styles.loadingText}>분석 수치를 불러오는 중…</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>문서 분석 요약</h2>
        <p className={styles.errorText} role="status">
          {error}
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const c = data.complexity;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>문서 분석 요약</h2>
      <p className={styles.sectionHint}>
        PDF 구조와 문장 단위 파이프라인 기준 집계입니다.
      </p>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>페이지</span>
          <span className={styles.statValue}>{formatInt(data.pageCount)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>문장</span>
          <span className={styles.statValue}>
            {formatInt(Number(data.sentenceCount))}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>문단</span>
          <span className={styles.statValue}>
            {formatInt(data.paragraphCount)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>수식 구간</span>
          <span className={styles.statValue}>{formatInt(Number(data.mathCount))}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>이미지</span>
          <span className={styles.statValue}>{formatInt(data.imageCount)}</span>
        </div>
      </div>

      {c != null && (
        <div className={styles.complexityCard}>
          <div className={styles.complexityMain}>
            <span className={styles.complexityLabel}>복잡도 점수 (v1)</span>
            <span className={styles.complexityScore}>{formatFixed(c.score, 2)}</span>
          </div>
          <div className={styles.complexityMeta}>
            <span>평균 문단 길이 {formatFixed(c.averageParagraphLength, 1)}자</span>
          </div>
          <div className={styles.complexityBreakdown}>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>수식 항</span>
              <span className={styles.breakdownVal}>
                {formatFixed(c.mathContribution, 2)}
              </span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>이미지 항</span>
              <span className={styles.breakdownVal}>
                {formatFixed(c.imageContribution, 2)}
              </span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>길이 항</span>
              <span className={styles.breakdownVal}>
                {formatFixed(c.lengthContribution, 2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {data.pages.length > 0 && (
        <div className={styles.pageTableWrap}>
          <h3 className={styles.tableTitle}>페이지별 분포</h3>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">페이지</th>
                  <th scope="col">문장</th>
                  <th scope="col">문단</th>
                  <th scope="col">수식</th>
                  <th scope="col">이미지</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.map((p) => (
                  <tr key={p.pageNumber}>
                    <td>{p.pageNumber}</td>
                    <td>{formatInt(p.sentenceCount)}</td>
                    <td>{formatInt(p.paragraphCount)}</td>
                    <td>{formatInt(p.mathCount)}</td>
                    <td>{formatInt(p.imageCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

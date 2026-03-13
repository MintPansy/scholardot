"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReadHeader from "../../header/ReadHeader";
import styles from "./readList.module.css";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
interface TranslationPair {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
}

/** 페이지당 문장(항목) 수 (7~8문장 단위) */
const ITEMS_PER_PAGE = 8;

export default function ReadList() {
  const [data] = useState<TranslationPair[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem("translationPairs");
      if (stored) {
        const parsed = JSON.parse(stored) as TranslationPair[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  const [fileName] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("fileName");
    return stored?.trim() ?? "";
  });

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "korean" | "english">(
    "all"
  );

  // 파생 값: 7~8문장 단위로 페이지 묶음
  const dataToPage = useMemo(
    () =>
      data.length === 0
        ? []
        : data.map((_, i) => Math.floor(i / ITEMS_PER_PAGE) + 1),
    [data]
  );
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const pageToFirstIdx = useMemo(() => {
    const p2i = new Map<number, number>();
    for (let p = 1; p <= totalPages; p++) {
      p2i.set(p, (p - 1) * ITEMS_PER_PAGE);
    }
    return p2i;
  }, [totalPages]);

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 문장 선택 시 모달(팝오버) 상태
  const [selectionModal, setSelectionModal] = useState<{
    text: string;
    rect: DOMRect;
  } | null>(null);
  const selectionModalRef = useRef<HTMLDivElement>(null);
  const selectionModalTextRef = useRef<string | null>(null);

  useEffect(() => {
    selectionModalTextRef.current = selectionModal?.text ?? null;
  }, [selectionModal]);

  const closeSelectionModal = useCallback(() => setSelectionModal(null), []);

  const handleCopySelection = useCallback(() => {
    const text = selectionModalTextRef.current;
    if (text) {
      navigator.clipboard.writeText(text).catch(() => {});
      setSelectionModal(null);
    }
  }, []);

  // 본문 영역에서 텍스트 선택 시 모달 표시
  useEffect(() => {
    const contentEl = contentScrollRef.current;
    if (!contentEl) return;

    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel) return;
      const text = sel.toString().trim();
      if (!text) {
        setSelectionModal(null);
        return;
      }
      const anchorNode = sel.anchorNode;
      if (!anchorNode || !contentEl.contains(anchorNode)) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        setSelectionModal({ text, rect });
      }
    };

    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim() === "") {
        setSelectionModal(null);
      }
    };

    contentEl.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      contentEl.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, []);

  // 모달 외부 클릭 시 닫기
  useClickOutSide(
    selectionModalRef as React.RefObject<HTMLElement>,
    closeSelectionModal
  );

  // ─── 스크롤 → 현재 페이지 감지 ───
  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el || dataToPage.length === 0) return;

    // 페이지 경계: 각 페이지의 첫 번째 항목 index (오름차순)
    const boundaries: { pageNum: number; dataIdx: number }[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < dataToPage.length; i++) {
      const p = dataToPage[i];
      if (!seen.has(p)) {
        seen.add(p);
        boundaries.push({ pageNum: p, dataIdx: i });
      }
    }
    if (boundaries.length === 0) return;

    let rafId = 0;

    const detect = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);

      // 스크롤이 맨 아래에 가까우면 마지막 페이지로 (여유 있게 감지)
      const threshold = Math.max(120, clientHeight * 0.15);
      const atBottom = maxScroll <= 1 || scrollTop >= maxScroll - threshold;
      if (atBottom && boundaries.length > 0) {
        const lastPage = boundaries[boundaries.length - 1].pageNum;
        setSelectedPageIndex(lastPage - 1);
        return;
      }

      // 역순 탐색: scrollTop이 해당 항목의 offsetTop을 지났으면 그 페이지
      let currentPage = boundaries[0].pageNum;
      for (let b = boundaries.length - 1; b >= 0; b--) {
        const ref = itemRefs.current[boundaries[b].dataIdx];
        if (!ref) continue;
        if (scrollTop + 60 >= ref.offsetTop) {
          currentPage = boundaries[b].pageNum;
          break;
        }
      }

      setSelectedPageIndex(currentPage - 1);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        detect();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    detect(); // 초기 상태
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dataToPage]);

  // ─── 6. 페이지 이동 ───
  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const pageNum = pageIndex + 1;
      const dataIdx = pageToFirstIdx.get(pageNum);

      if (dataIdx !== undefined && itemRefs.current[dataIdx]) {
        const el = contentScrollRef.current;
        const target = itemRefs.current[dataIdx];
        if (el && target) {
          // scrollIntoView 대신 직접 계산 (스크롤 컨테이너 내부 정확한 위치)
          const containerRect = el.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const offset = targetRect.top - containerRect.top + el.scrollTop;
          el.scrollTo({ top: offset, behavior: "smooth" });
        }
        setSelectedPageIndex(pageIndex);
        return;
      }

      // 폴백
      const el = contentScrollRef.current;
      if (el) {
        el.scrollTo({ top: pageIndex * el.clientHeight, behavior: "smooth" });
      }
      setSelectedPageIndex(pageIndex);
    },
    [pageToFirstIdx]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const pageIndex = Math.max(0, Math.min(page - 1, totalPages - 1));
      scrollToPage(pageIndex);
    },
    [totalPages, scrollToPage]
  );

  const handleToggleSidebar = () => setShowSidebar((prev) => !prev);
  const handleFilterChange = (mode: "all" | "korean" | "english") =>
    setFilterMode(mode);

  // ─── 렌더링 ───
  return (
    <main className={styles.container}>
      <ReadHeader
        fileName={fileName}
        currentPage={selectedPageIndex + 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onToggleSidebar={handleToggleSidebar}
        filterMode={filterMode}
        onFilterChange={handleFilterChange}
      />
      <div className={styles.content}>
        {showSidebar && (
          <aside className={styles.sidebar}>
            <ul className={styles.pageList}>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={styles.pageListItem}>
                  <button
                    type="button"
                    className={`${styles.pageCard} ${
                      index === selectedPageIndex ? styles.pageCardSelected : ""
                    }`}
                    onClick={() => scrollToPage(index)}
                    aria-pressed={index === selectedPageIndex}>
                    <div className={styles.pagePreview}>
                      {(() => {
                        const firstIdx = index * ITEMS_PER_PAGE;
                        const item = data[firstIdx];
                        if (!item) {
                          return (
                            <div className={styles.pagePreviewPlaceholder} />
                          );
                        }
                        const pageItems = data.slice(
                          firstIdx,
                          firstIdx + ITEMS_PER_PAGE
                        );
                        return (
                          <div className={styles.pagePreviewText}>
                            {pageItems.flatMap((x) => [
                              <div
                                key={`${x.docUnitId}-en`}
                                className={styles.pagePreviewRow}>
                                <p className={styles.pagePreviewTextSourceText}>
                                  {x.sourceText || " "}
                                </p>
                              </div>,
                              <div
                                key={`${x.docUnitId}-ko`}
                                className={styles.pagePreviewRow}>
                                <p className={styles.pagePreviewTextText}>
                                  {x.translatedText || " "}
                                </p>
                              </div>,
                            ])}
                          </div>
                        );
                      })()}
                    </div>
                    <span className={styles.pageNumber}>{index + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div
          ref={contentScrollRef}
          className={styles.docUnitId}
          role="region"
          aria-label="문서 본문"
          style={showSidebar ? {} : { width: "100%" }}>
          {data.map((item, index) => (
            <div
              key={item.docUnitId}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}>
              {filterMode === "all" && (
                <>
                  <p className={styles.sourceText}>{item.sourceText}</p>
                  <p className={styles.translatedText}>{item.translatedText}</p>
                </>
              )}
              {filterMode === "english" && (
                <p className={styles.sourceText}>{item.sourceText}</p>
              )}
              {filterMode === "korean" && (
                <p className={styles.translatedText}>{item.translatedText}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 텍스트 선택 시 팝오버 모달 */}
      {selectionModal && (
        <div
          ref={selectionModalRef}
          className={styles.selectionModal}
          style={{
            top: selectionModal.rect.bottom + 8,
            left: Math.min(
              selectionModal.rect.left,
              typeof window !== "undefined"
                ? window.innerWidth - 320
                : selectionModal.rect.left
            ),
          }}
          role="dialog"
          aria-label="선택한 텍스트">
          <p className={styles.selectionModalText}>
            {selectionModal.text.length > 200
              ? `${selectionModal.text.slice(0, 200)}…`
              : selectionModal.text}
          </p>
          <div className={styles.selectionModalActions}>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={handleCopySelection}>
              복사
            </button>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={closeSelectionModal}>
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

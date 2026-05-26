"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LegalBlock, LegalDocumentConfig } from "@/app/content/legalTypes";
import { splitBlocksIntoSections } from "@/app/content/legalSections";
import { renderInlineBold } from "@/app/components/legal/inlineBold";
import styles from "./LegalDocument.module.css";

function renderBlock(block: LegalBlock, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={index} className={styles.h2}>
          {renderInlineBold(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className={styles.h3}>
          {renderInlineBold(block.text)}
        </h3>
      );
    case "p":
      return (
        <p key={index} className={styles.p}>
          {renderInlineBold(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className={`${styles.list} ${styles.ul}`}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInlineBold(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className={`${styles.list} ${styles.ol}`}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInlineBold(item)}</li>
          ))}
        </ol>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export type LegalDocumentProps = {
  config: LegalDocumentConfig;
  emptyFallback?: {
    message: string;
    email: string;
  };
};

function LegalMetaBar({ config }: { config: LegalDocumentConfig }) {
  const meta = config.meta;
  if (!meta) return null;

  const items: { label: string; node: ReactNode }[] = [];

  if (meta.updatedAt) {
    items.push({ label: "최종 수정", node: meta.updatedAt });
  }
  if (meta.effectiveDate) {
    items.push({ label: "시행일", node: meta.effectiveDate });
  }
  if (meta.contactEmail) {
    items.push({
      label: "문의",
      node: (
        <a href={`mailto:${meta.contactEmail}`} className={styles.metaLink}>
          {meta.contactEmail}
        </a>
      ),
    });
  }
  if (meta.relatedLinks?.length) {
    items.push({
      label: "관련 문서",
      node: (
        <span className={styles.metaLinks}>
          {meta.relatedLinks.map((link, i) => (
            <span key={link.href}>
              {i > 0 && <span className={styles.metaSep}>·</span>}
              <Link href={link.href} className={styles.metaLink}>
                {link.label}
              </Link>
            </span>
          ))}
        </span>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <dl className={styles.metaBar}>
      {items.map((item) => (
        <div key={item.label} className={styles.metaItem}>
          <dt className={styles.metaLabel}>{item.label}</dt>
          <dd className={styles.metaValue}>{item.node}</dd>
        </div>
      ))}
    </dl>
  );
}

function LegalSummary({ items }: { items: NonNullable<LegalDocumentConfig["summary"]> }) {
  return (
    <aside className={styles.summary} aria-label="핵심 요약">
      <p className={styles.summaryTitle}>핵심 요약</p>
      <ul className={styles.summaryList}>
        {items.map((item) => (
          <li key={item.label} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{item.label}</span>
            <span className={styles.summaryValue}>{item.value}</span>
          </li>
        ))}
      </ul>
      <p className={styles.summaryNote}>아래 전문과 함께 확인해 주세요.</p>
    </aside>
  );
}

function TableOfContents({
  sections,
  activeId,
  onNavigate,
}: {
  sections: { id: string; title: string }[];
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className={styles.tocNav} aria-label="목차">
      <p className={styles.tocHeading}>목차</p>
      <ol className={styles.tocList}>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`${styles.tocLink} ${activeId === section.id ? styles.tocLinkActive : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(section.id);
              }}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function LegalDocument({ config, emptyFallback }: LegalDocumentProps) {
  const hasBody = config.blocks.length > 0;
  const sections = useMemo(
    () => (hasBody ? splitBlocksIntoSections(config.blocks) : []),
    [config.blocks, hasBody],
  );
  const tocItems = useMemo(
    () => sections.map(({ id, title }) => ({ id, title })),
    [sections],
  );

  const [activeId, setActiveId] = useState<string | null>(tocItems[0]?.id ?? null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setMobileTocOpen(false);
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  useEffect(() => {
    if (!hasBody || tocItems.length === 0) return;

    const elements = tocItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasBody, tocItems]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && tocItems.some((t) => t.id === hash)) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [tocItems, scrollToSection]);

  return (
    <main className={styles.wrap}>
      <div className={styles.shell}>
        <div className={styles.layout}>
          {hasBody && tocItems.length > 0 && (
            <aside className={styles.tocAside} aria-label="문서 목차">
              <TableOfContents
                sections={tocItems}
                activeId={activeId}
                onNavigate={scrollToSection}
              />
            </aside>
          )}

          <div className={styles.docColumn}>
            {hasBody && tocItems.length > 0 && (
              <div className={styles.mobileTocWrap}>
                <button
                  type="button"
                  className={styles.mobileTocBtn}
                  aria-expanded={mobileTocOpen}
                  onClick={() => setMobileTocOpen((open) => !open)}
                >
                  {mobileTocOpen ? "목차 닫기" : "목차 보기"}
                </button>
                {mobileTocOpen && (
                  <div className={styles.mobileTocPanel}>
                    <TableOfContents
                      sections={tocItems}
                      activeId={activeId}
                      onNavigate={scrollToSection}
                    />
                  </div>
                )}
              </div>
            )}

            <article className={styles.document}>
              <header className={styles.header}>
                <p className={styles.kicker}>정책</p>
                <h1 className={`${styles.title} font-landing-display`}>{config.pageTitle}</h1>
                {config.lead.map((line, i) => (
                  <p key={i} className={styles.lead}>
                    {renderInlineBold(line)}
                  </p>
                ))}
                <LegalMetaBar config={config} />
              </header>

              {config.summary && config.summary.length > 0 && (
                <LegalSummary items={config.summary} />
              )}

              <div className={styles.body}>
                {!hasBody && emptyFallback ? (
                  <>
                    <p className={styles.fallback}>{emptyFallback.message}</p>
                    <p className={styles.contact}>
                      <a href={`mailto:${emptyFallback.email}`}>
                        문의: {emptyFallback.email}
                      </a>
                    </p>
                  </>
                ) : (
                  sections.map((section, sectionIndex) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className={`${styles.articleSection} ${sectionIndex > 0 ? styles.articleSectionDivider : ""}`}
                    >
                      {section.blocks.map((block, i) => renderBlock(block, i))}
                    </section>
                  ))
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}

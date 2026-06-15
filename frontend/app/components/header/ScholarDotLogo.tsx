import Link from "next/link";
import styles from "./scholarDotLogo.module.css";

type ScholarDotLogoProps = {
  href?: string;
  variant?: "header" | "footer";
};

/**
 * 학술 테마 로고: "S." 아이콘 + "ScholarDot" 텍스트
 * Notion / arXiv 느낌의 간결한 브랜딩
 */
export default function ScholarDotLogo({
  href = "/",
  variant = "header",
}: ScholarDotLogoProps) {
  const content = (
    <>
      <span className={styles.icon} aria-hidden>
        S.
      </span>
      <span className={styles.wordmark}>ScholarDot</span>
    </>
  );

  const className = `${styles.logo} ${variant === "footer" ? styles.logoFooter : ""}`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label="ScholarDot 홈으로">
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

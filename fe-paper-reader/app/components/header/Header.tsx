import Image from "next/image";
import Link from "next/link";
import styles from "./header.module.css";
import IsLogin from "@/app/components/header/loginstatus/IsLogin";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/newlogo.png"
            alt="PaperDot"
            width={180}
            height={60}
            className={styles.logoImage}
            priority
          />
        </Link>
        <IsLogin />
      </div>
    </header>
  );
}

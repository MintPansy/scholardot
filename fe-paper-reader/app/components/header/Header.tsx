import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";
import IsLogin from "@/app/components/header/loginstatus/IsLogin";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.link}>
          <Image src="/Logo.svg" alt="Paperdot" width={106} height={40} />
        </Link>
        <IsLogin />
      </div>
    </header>
  );
}

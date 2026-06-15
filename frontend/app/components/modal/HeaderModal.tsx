"use client";

import React, { useState, useEffect, useRef, Activity } from "react";
import styles from "./headerModal.module.css";
import Button from "../button/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { logout } from "@/app/services/logout";
import { clearDemoSession, isDemoUserActive } from "@/lib/authSession";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
import { toast } from "react-toastify";

export default function HeaderModal({
  isReadHeader,
  className,
  onLogout,
}: {
  isReadHeader?: boolean;
  className?: string;
  accessToken?: string;
  onLogout?: () => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef<string>(pathname);
  const userInfo = useLoginStore((state) => state.userInfo);

  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setUserInfoState = useLoginStore((state) => state.setUserInfo);
  const setLogin = useLoginStore((state) => state.setLogin);
  const router = useRouter();
  const isDemo = isDemoUserActive(userInfo?.userId);

  // 경로 변경 시 모달 닫기
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setIsOpen(false);
    }
  }, [pathname]);

  // 바깥 클릭 감지
  useClickOutSide(modalRef as React.RefObject<HTMLElement>, setIsOpen);

  const handleMembersOnlyNav = () => {
    setIsOpen(false);
    toast.info("로그인 후에만 이용할 수 있습니다.");
    router.push("/login");
  };

  const handleMembersOnlyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleMembersOnlyNav();
  };

  const handleLogoutClick = async () => {
    if (isDemo) {
      clearDemoSession();
      setAccessToken(null);
      setUserInfoState(null);
      setLogin(false);
      onLogout?.();
      setIsOpen(false);
      window.location.href = "/";
      return;
    }

    try {
      if (accessToken) {
        await logout(accessToken);
        clearDemoSession();
      } else {
        clearDemoSession();
      }
    } finally {
      setAccessToken(null);
      setUserInfoState(null);
      setLogin(false);
      onLogout?.();
      setIsOpen(false);
      router.push("/login");
    }
  };

  return (
    <div
      className={className ? className : styles.headerModalContainer}
      ref={modalRef}>
      <div className={styles.myPageButtonContainer}>
        {!isReadHeader && (
          <Button
            className={styles.newDocumentButton}
            onClick={() => {
              if (isDemo) {
                handleMembersOnlyNav();
                return;
              }
              router.push("/newdocument");
            }}>
            새 문서 만들기
          </Button>
        )}
        <Button
          className={styles.userImageButton}
          onClick={() => setIsOpen(!isOpen)}>
          {userInfo?.profileImageUrl?.includes("http") ? (
            <Image
              src={userInfo.profileImageUrl}
              alt="user image"
              width={40}
              height={40}
              className={styles.userImage}
              unoptimized
            />
          ) : (
            <Image
              src={userInfo?.profileImageUrl || "/userImage.svg"}
              alt="user image"
              width={40}
              height={40}
              className={styles.userImage}
            />
          )}
        </Button>
      </div>
      <Activity mode={isOpen ? "visible" : "hidden"}>
        <div className={styles.headerModalWrapper}>
          <div className={styles.headerModal}>
            <p className={styles.headerModalName}>
              {userInfo?.nickname || "김유저"}
            </p>
          </div>
          <div className={styles.headerMiddleTitleContainer}>
            <Link
              href="/mypage/mydocument"
              className={styles.headerMiddleTitle}
              onClick={
                isDemo
                  ? handleMembersOnlyClick
                  : () => {
                      setIsOpen(false);
                    }
              }>
              내 문서함
            </Link>
            <Link
              href="/mypage/account"
              className={styles.headerMiddleTitle}
              onClick={
                isDemo
                  ? handleMembersOnlyClick
                  : () => {
                      setIsOpen(false);
                    }
              }>
              내 계정
            </Link>
          </div>
          <Button
            className={styles.headerModalLogoutButton}
            onClick={handleLogoutClick}>
            <p className={styles.headerModalEmail}>로그아웃</p>
          </Button>
        </div>
      </Activity>
    </div>
  );
}

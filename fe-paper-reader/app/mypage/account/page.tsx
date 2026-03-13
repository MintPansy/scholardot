"use client";

import { useState } from "react";
import styles from "@/app/mypage/account/account.module.css";
import Button from "@/app/components/button/Button";
import Image from "next/image";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { logout } from "@/app/services/logout";
import { useHttps } from "@/app/utils/useHttps";
import DeleteUserModal from "@/app/components/modal/DeleteUserModal";

export default function MyAccount() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const userInfo = useLoginStore((state) => state.userInfo);
  const setUserInfoState = useLoginStore((state) => state.setUserInfo);
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  const handleLogoutClick = async () => {
    try {
      if (accessToken) {
        await logout(accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 상태 완전히 초기화 (에러가 발생해도 초기화)
      setAccessToken(null);
      // userInfo를 null로 설정하여 로그인 전 상태로 복귀
      setUserInfoState({
        profileImageUrl: "",
        nickname: "",
        email: "",
      });
      // 완전히 새로고침하여 로그인 전 헤더 상태로 복귀
      window.location.href = "/";
    }
  };

  return (
    <main className={styles.accountSection}>
      <section className={styles.accountTopBar}>
        <div className={styles.accountProfileBar}>
          <div className={styles.accountProfileImageSmallContainer}>
            {userInfo?.profileImageUrl?.includes("http") ? (
              <Image
                src={useHttps(userInfo.profileImageUrl)}
                alt="profile"
                width={80}
                height={80}
                className={styles.accountProfileImage}
                unoptimized
              />
            ) : (
              <Image
                src={userInfo?.profileImageUrl || "/userImage.svg"}
                alt="profile"
                width={80}
                height={80}
                className={styles.accountProfileImage}
              />
            )}
          </div>
          <h2 className={styles.accountProfileNameSmall}>
            {userInfo?.nickname || "김유저"}
          </h2>
        </div>
        <Button
          className={styles.accountLogoutBtnTop}
          onClick={handleLogoutClick}>
          로그아웃
        </Button>
      </section>

      <div className={styles.accountFormSection}>
        <div className={styles.accountFormRow}>
          <p className={styles.accountFormLabel}>소셜 로그인</p>
          <div className={styles.accountSocialLoginRight}>
            <Image
              src={
                userInfo?.email?.includes("gmail")
                  ? "/googleLogo.svg"
                  : "/kakaoIcon.svg"
              }
              alt={userInfo?.email?.includes("gmail") ? "google" : "kakao"}
              width={24}
              height={24}
              className={
                userInfo?.email?.includes("gmail") ? styles.googleLogo : ""
              }
            />
            <p className={styles.accountSocialLoginText}>
              {userInfo?.email?.includes("gmail.com")
                ? "구글 연동 로그인"
                : "카카오톡 연동 로그인"}
            </p>
          </div>
        </div>

        <div className={styles.accountFormRow}>
          <p className={styles.accountFormLabel}>이름</p>
          <div className={styles.accountInputContainer}>
            <p className={styles.accountInputText}>
              {userInfo?.nickname || "김유저"}
            </p>
          </div>
        </div>
      </div>

      <section className={styles.accountManagementSection}>
        <Button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteAccountLink}>
          <p className={styles.deleteAccountLinkText}>탈퇴하기</p>
        </Button>
      </section>
      {showDeleteModal && (
        <DeleteUserModal
          setShowDeleteModal={setShowDeleteModal}
          accessToken={accessToken as string}
          userInfo={
            userInfo as {
              email: string;
              nickname: string;
              profileImageUrl: string;
            }
          }
        />
      )}
    </main>
  );
}

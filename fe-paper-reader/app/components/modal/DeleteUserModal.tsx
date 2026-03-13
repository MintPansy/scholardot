"use client";

import styles from "@/app/components/modal/DeleteUserModal.module.css";
import { DELETE_REASON_OPTIONS } from "@/app/consts/deleteConsts";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../button/Button";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
import { toast, ToastContainer } from "react-toastify";
import { withdraw } from "@/app/services/withdraw";

export default function DeleteUserModal({
  accessToken,
  userInfo,
  setShowDeleteModal,
}: {
  setShowDeleteModal: (show: boolean) => void;
  accessToken: string;
  userInfo: {
    email: string;
    nickname: string;
    profileImageUrl: string;
  };
}) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [agreeChecked, setAgreeChecked] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");
  const customOptionsRef = useRef<HTMLUListElement>(null);

  useClickOutSide(
    customOptionsRef as React.RefObject<HTMLElement>,
    setShowDropdown
  );

  const handleConfirmDelete = async () => {
    try {
      if (!accessToken) {
        toast.error("로그인 상태가 아닙니다. 다시 로그인해주세요.");
        return;
      }

      const response = await withdraw(
        userInfo?.email?.includes("gmail.com") ? "google" : "kakao",
        accessToken
      );
      if (response.ok) {
        setShowDeleteModal(false);
        window.location.href = "/";
      } else {
        toast.error("회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className={styles.deleteModal}>
      <ToastContainer position="top-right" theme="colored" autoClose={1500} />

      <div className={styles.deleteModalContent}>
        <h2 className={styles.deleteModalTitle}>회원 탈퇴</h2>

        <p className={styles.deleteModalMessage}>
          탈퇴 시 번역 기록, 내정보를 포함한 모든 데이터가 삭제되며 <br />
          복구할 수 없습니다.
        </p>

        <label className={styles.agreeCheckbox}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={agreeChecked}
            onChange={() => setAgreeChecked((prev) => !prev)}
          />
          <span className={styles.checkboxLabel}>동의합니다.</span>
        </label>

        <div className={styles.deleteReasonSection}>
          <label className={styles.deleteReasonLabel}>
            계정 삭제 이유를 알려주세요
          </label>

          {/* 🔥 커스텀 드롭다운 */}
          <div className={styles.selectWrapper}>
            <div
              className={
                showDropdown
                  ? styles.customSelectValueHidden
                  : styles.customSelectValue
              }
              onClick={() => setShowDropdown((prev) => !prev)}>
              <p className={styles.customSelectValueText}>
                {selectedReason || "선택해주세요"}
              </p>
              <ChevronDown className={styles.dropdownIcon} />
            </div>

            {showDropdown && (
              <ul className={styles.customOptions} ref={customOptionsRef}>
                {DELETE_REASON_OPTIONS.map((option) => (
                  <li
                    key={option.value}
                    className={styles.customOption}
                    onClick={() => {
                      setSelectedReason(option.label);
                      setShowDropdown(false);
                    }}>
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 기타 선택 시 textarea */}
          {selectedReason === "기타(직접입력)" && (
            <div className={styles.customReasonWrapper}>
              <textarea
                placeholder="직접 입력해주세요"
                className={styles.customReasonTextarea}
                maxLength={80}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
              <div className={styles.charCountWrapper}>
                <span className={styles.charCountCurrent}>
                  {customReason.length}
                </span>
                <span className={styles.charCountMax}> / 80</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.deleteModalButtons}>
          <Button
            className={styles.deleteModalCancelBtn}
            onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className={
              agreeChecked
                ? styles.deleteModalConfirmBtn
                : styles.deleteModalConfirmBtnDisabled
            }>
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  );
}

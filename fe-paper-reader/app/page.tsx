"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLoginStore } from "@/app/store/useLogin";

export default function Home() {
  const userInfo = useLoginStore((s) => s.userInfo);
  const ctaHref = userInfo?.userId ? "/newdocument" : "/login";
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoImgError, setDemoImgError] = useState(false);

  return (
    <main className="home-page block min-h-screen w-full bg-slate-50">
      {/* Hero — 가운데 정렬 */}
      <section className="relative flex w-full min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-900 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-5 py-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            영어 논문을
            <br className="hidden sm:block" />
            노트처럼 읽으세요
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-200/90 sm:text-xl md:text-2xl">
            문장 단위로 원문과 번역을 나란히 보고,
            <br className="hidden sm:block" />
            중요한 부분만 표시하며 집중해서 읽을 수 있습니다.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href={ctaHref}
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 sm:h-14 sm:text-lg"
            >
              지금 시작하기
            </Link>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-xl border-2 border-white/40 bg-transparent px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:h-14 sm:text-lg"
            >
              데모 보기
            </button>
          </div>
        </div>
      </section>

      {/* 핵심 기능 — 가운데 정렬 */}
      <section className="flex w-full flex-col items-center bg-white py-24 sm:py-28 md:py-36">
        <div className="flex w-full max-w-7xl flex-col items-center px-5">
          <h2 className="mb-20 text-center text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            핵심 기능
          </h2>

          <div className="grid w-full max-w-6xl grid-cols-1 justify-items-center gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {/* 카드 1 */}
            <div className="flex w-full max-w-lg min-h-[320px] flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 pt-3 pb-10 text-center shadow-md transition hover:shadow-xl hover:-translate-y-1">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl shadow-inner">
                📖
              </div>
              <h3 className="mb-4 text-center text-2xl font-semibold text-slate-800 sm:text-3xl">문장 단위 병렬 읽기</h3>
              <p className="text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
                한 줄에 원문과 번역을 동시에 보여줍니다.
                원문/번역/전체 모드로 자유롭게 전환 가능
              </p>
            </div>

            {/* 카드 2 */}
            <div className="flex w-full max-w-lg min-h-[320px] flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 pt-3 pb-10 text-center shadow-md transition hover:shadow-xl hover:-translate-y-1">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl shadow-inner">
                📄
              </div>
              <h3 className="mb-4 text-center text-2xl font-semibold text-slate-800 sm:text-3xl">빠른 PDF 페이지 이동</h3>
              <p className="text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
                사이드바 썸네일과 페이지 번호 클릭으로
                원하는 페이지로 즉시 이동합니다
              </p>
            </div>

            {/* 카드 3 */}
            <div className="flex w-full max-w-lg min-h-[320px] flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 pt-3 pb-10 text-center shadow-md transition hover:shadow-xl hover:-translate-y-1">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl shadow-inner">
                📁
              </div>
              <h3 className="mb-4 text-center text-2xl font-semibold text-slate-800 sm:text-3xl">내 문서함 & 이어 읽기</h3>
              <p className="text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
                최근 문서 목록과 마지막 읽은 위치 자동 저장
                언제든 편하게 이어서 읽기 가능
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 데모 섹션 — 가운데 정렬 */}
      <section className="flex w-full flex-col items-center bg-slate-50 py-24 sm:py-28 md:py-36">
        <div className="flex w-full max-w-7xl flex-col items-center px-5">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            실제로 이렇게 읽습니다
          </h2>
          <p className="mb-12 text-center text-xl text-slate-600 md:text-2xl">
            문장 단위 병렬 보기 · 스크롤 동기화 · 하이라이트·메모 저장
          </p>

          <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="relative aspect-[4/3] w-full md:aspect-video">
              {!demoImgError ? (
                <Image
                  src="/demo-screenshot.png"
                  alt="ScholarDot 리더 화면"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1536px) 100vw, 1536px"
                  onError={() => setDemoImgError(true)}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
                  <p className="text-center text-xl">
                    리더 화면 스크린샷 자리<br />
                    (public/demo-screenshot.png 파일을 추가해주세요)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex w-full flex-col items-center bg-gradient-to-r from-blue-600 to-blue-800 py-24 sm:py-28 md:py-36">
        <div className="flex max-w-4xl flex-col items-center px-5 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            지금 PDF를 업로드하고
            <br className="hidden sm:block" />
            편하게 읽기 시작하세요
          </h2>
          <p className="mt-6 text-xl text-blue-100 md:text-2xl">
            업로드 한 번으로 모든 기능을 바로 경험할 수 있습니다.
          </p>

          <Link
            href={ctaHref}
            className="mt-10 inline-flex h-14 min-w-[260px] items-center justify-center rounded-xl bg-white px-10 text-lg font-bold text-blue-700 shadow-xl transition hover:bg-blue-50"
          >
            문서 읽기 시작하기
          </Link>
        </div>
      </section>

      {/* 데모 모달 (변경 없음) */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDemoOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-3 text-slate-700 hover:bg-slate-100"
              onClick={() => setDemoOpen(false)}
            >
              ✕
            </button>
            <div className="relative aspect-video w-full bg-slate-900">
              <Image src="/demo-screenshot.png" alt="리더 데모" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
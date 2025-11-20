// sodamiya/wellio3/Wellio3-c7489bae5f1d8ec30008af7c58f107c1e3f5acb2/src/components/OnboardingPage.tsx
"use client";

import { useState } from "react";
import { HomePage } from "./HomePage";
import { CommunityPage } from "./CommunityPage";
import { MedicalHistoryPage } from "./MedicalHistoryPage";
import { ProfilePage } from "./ProfilePage";
import { BottomNav } from "./BottomNav";

// BottomNav에서 정의된 페이지 타입과 일치하도록 정의
const pageSlugs = [
  "home",
  "community",
  "medical-history",
  "profile",
] as const;
type PageSlug = (typeof pageSlugs)[number];

interface OnboardingPageProps {
  onComplete: () => void;
  userName: string;
  posts: any[];
}

export function OnboardingPage({
  onComplete,
  userName,
  posts,
}: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "홈",
      description:
        "새로운 소식과 유용한 건강 정보를 한눈에 확인하세요",
    },
    {
      title: "커뮤니티",
      description:
        "가족과 함께 소중한 추억을 만들고 서로 응원해 보세요",
    },
    {
      title: "진료내역",
      description:
        "진료받은 날짜, 병원, 증상 등을 조회하고 필요한 정보를 바로 확인해 보세요",
    },
    {
      title: "내정보",
      description:
        "스마트 기기를 연동하고 나만의 건강 데이터를 관리하세요",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서는 온보딩 완료
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // GNB 클릭 이벤트는 온보딩 중에는 무시
  const handlePageChange = (page: PageSlug) => {
    console.log(
      `GNB clicked: ${page}. Ignoring during onboarding.`,
    );
  };

  // 온보딩 배경 페이지 컴포넌트의 onBack, onClick 등의 props 처리를 위한 더미 함수
  const dummyAction = () => {
    console.log("Dummy action called during onboarding.");
  };

  const progressPercentage =
    ((currentStep + 1) / steps.length) * 100;

  // 터치 이벤트 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    (e.currentTarget as HTMLElement).setAttribute(
      "data-touch-start",
      touchStartX.toString(),
    );
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat(
      (e.currentTarget as HTMLElement).getAttribute(
        "data-touch-start",
      ) || "0",
    );
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // 스와이프 감지 (50px 이상 움직였을 때)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 - 다음
        handleNext();
      }
      // 오른쪽 스와이프는 무시 (이전으로 가지 않음)
    }
  };

  const handleClick = () => {
    handleNext();
  };

  // 구멍 뚫기 효과를 위한 상수 정의
  const holeRadiusPx = 32; // size-16 (64px)의 반지름
  const gnbCenterFromBottom = 40; // GNB 높이 h-20(80px)의 중앙
  const spreadDistance = 2000; // 화면을 충분히 덮을 그림자 확산 거리

  return (
    <div
      className="relative min-h-screen bg-[#2c3e50] text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* -------------------- 1. 배경 페이지 (흐릿하게) -------------------- */}
      {/* GNB를 포함한 전체 화면 구조를 렌더링하고 opacity를 적용하여 배경처럼 보이게 합니다. z-0 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="max-w-[500px] mx-auto min-h-screen flex flex-col">
          {/* 페이지 콘텐츠: opacity-30 적용 */}
          <div className="flex-1 overflow-auto opacity-30">
            {currentStep === 0 && (
              <HomePage
                userName={userName}
                currentPage="home"
                onPageChange={handlePageChange}
              />
            )}
            {currentStep === 1 && (
              <CommunityPage
                onBack={dummyAction}
                onUploadClick={dummyAction}
                onNotificationClick={dummyAction}
                onDeletePost={dummyAction}
                posts={posts}
                currentUserName={userName}
              />
            )}
            {currentStep === 2 && (
              <MedicalHistoryPage onBack={dummyAction} />
            )}
            {currentStep === 3 && (
              <ProfilePage
                userName={userName}
                currentPage="profile"
                onPageChange={handlePageChange}
                onBack={dummyAction}
                onMyReviewsClick={dummyAction}
                onFavoriteHospitalsClick={dummyAction}
              />
            )}
          </div>
          {/* GNB (BottomNav) 배치: 투명도(opacity-30)에서 제외하여 선명하게 노출 */}
          <div className="opacity-100">
            <BottomNav
              currentPage={pageSlugs[currentStep]}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* -------------------- 2. 스포트라이트 오버레이 (구멍 뚫기) -------------------- */}
      {/* GNB 위에 위치하여 (z-50) 투명한 구멍을 만듭니다. */}
      <div
        // 전체 화면을 덮는 Fixed 레이어 (max-w 제한 적용)
        className="fixed inset-0 max-w-[500px] mx-auto z-50 pointer-events-none"
      >
        {/* 구멍을 뚫을 원형 요소: 이 요소 자체는 투명하고, 그림자만 화면을 덮습니다. */}
        <div
          className="absolute size-16 rounded-full"
          style={{
            // 4개의 탭 중 현재 단계에 맞게 X 위치 계산
            left: `calc((100% / 4) * ${currentStep} + (100% / 8))`,
            // Y 위치 계산: GNB 중앙(40px) - 원 반지름(32px) = 8px
            bottom: `${gnbCenterFromBottom - holeRadiusPx}px`,
            transform: "translateX(-50%)",

            // **핵심:** 원형 영역을 제외한 모든 곳을 어둡게 덮는 그림자 (구멍 생성)
            boxShadow: `0 0 0 ${spreadDistance}px rgba(0, 0, 0, 0.7)`,
          }}
        >
          {/* GNB 아이콘 주변에 빛나는 테두리 효과 추가 (선택 사항) */}
          <div
            className="w-full h-full rounded-full"
            style={{
              // inset box-shadow를 사용하여 원 내부의 투명한 영역에 빛나는 테두리 효과를 줍니다.
              boxShadow: `0 0 10px 10px rgba(77, 194, 192, 0.5) inset`,
            }}
          />
        </div>
      </div>

      {/* -------------------- 3. 온보딩 텍스트 및 버튼 콘텐츠 -------------------- */}
      {/* 가장 위에 위치하여 사용자 상호작용을 처리합니다. z-[60] */}
      <div className="relative z-[60] flex flex-col min-h-screen max-w-[500px] mx-auto">
        {/* 상단 바 */}
        <div className="px-5 py-4 flex items-center justify-between">
          {/* 진행 표시줄 */}
          <div className="flex-1 h-1 bg-white/30 rounded-full mr-5 overflow-hidden">
            <div
              className="h-full bg-[#4dc2c0] rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {/* SKIP 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="text-white text-base hover:opacity-80 transition-opacity"
          >
            SKIP
          </button>
        </div>

        {/* 중앙 빈 공간 */}
        <div className="flex-1"></div>

        {/* 하단 설명 영역 */}
        {/* GNB(h-20) 높이 80px를 고려하여 충분한 여백(pb-24 = 96px)을 줍니다. */}
        <div className="px-5 pt-5 pb-24">
          {/* 설명 박스 (말풍선) */}
          <div className="relative bg-[#4dc2c0] rounded-2xl p-5 mb-5">
            <h2 className="text-xl mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm leading-relaxed opacity-90">
              {steps[currentStep].description}
            </p>

            {/* 👇 [위치 보정 완료] 말풍선 화살표 */}
            <div
              className="absolute"
              style={{
                // [수학적 보정 로직]
                // 말풍선 컨테이너 너비(100%)는 전체 화면 너비보다 40px(좌우 패딩) 작습니다.
                // 따라서 (100% + 40px)를 곱해 전체 너비 기준으로 환산한 뒤,
                // GNB 비율을 적용하고, 다시 왼쪽 패딩(-20px)만큼 빼주어 정확한 위치를 잡습니다.
                left: `calc( (100% + 40px) * (${currentStep * 2 + 1} / 8) - 20px )`,

                bottom: "-10px", // 말풍선 바로 아래에 붙음
                transform: "translateX(-50%)", // 중앙 정렬

                // CSS로 삼각형 그리기 (네모 방지)
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid #4dc2c0", // 말풍선 색상과 동일
              }}
            ></div>
            {/* 👆 말풍선 화살표 */}
          </div>
        </div>
      </div>
    </div>
  );
}
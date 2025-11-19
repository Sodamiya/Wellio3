"use client";

import { useState } from "react";
import { HomePage } from "./HomePage";
import { CommunityPage } from "./CommunityPage";
import { MedicalHistoryPage } from "./MedicalHistoryPage";
import { ProfilePage } from "./ProfilePage";

interface OnboardingPageProps {
  onComplete: () => void;
  userName: string;
  posts: any[];
}

export function OnboardingPage({ onComplete, userName, posts }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "홈",
      description: "새로운 소식과 유용한 건강 정보를 한눈에 확인하세요",
    },
    {
      title: "커뮤니티",
      description: "가족과 함께 소중한 추억을 만들고 서로 응원해 보세요",
    },
    {
      title: "진료내역",
      description: "진료받은 날짜, 병원, 증상 등을 조회하고 필요한 정보를 바로 확인해 보세요",
    },
    {
      title: "내정보",
      description: "스마트 기기를 연동하고 나만의 건강 데이터를 관리하세요",
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // 터치 이벤트 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    (e.currentTarget as HTMLElement).setAttribute('data-touch-start', touchStartX.toString());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat((e.currentTarget as HTMLElement).getAttribute('data-touch-start') || '0');
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

  return (
    <div
      className="relative min-h-screen bg-[#2c3e50] text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* 배경 페이지 (흐릿하게) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {currentStep === 0 && (
          <div className="max-w-[500px] mx-auto">
            <HomePage
              userName={userName}
              currentPage="home"
              onPageChange={() => {}}
            />
          </div>
        )}
        {currentStep === 1 && (
          <div className="max-w-[500px] mx-auto">
            <CommunityPage
              onBack={() => {}}
              onUploadClick={() => {}}
              onNotificationClick={() => {}}
              posts={posts}
            />
          </div>
        )}
        {currentStep === 2 && (
          <div className="max-w-[500px] mx-auto">
            <MedicalHistoryPage onBack={() => {}} />
          </div>
        )}
        {currentStep === 3 && (
          <div className="max-w-[500px] mx-auto">
            <ProfilePage
              userName={userName}
              currentPage="profile"
              onPageChange={() => {}}
              onBack={() => {}}
              onMyReviewsClick={() => {}}
              onFavoriteHospitalsClick={() => {}}
            />
          </div>
        )}
      </div>

      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* 온보딩 콘텐츠 */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-[500px] mx-auto">
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
        <div className="px-5 pb-5">
          {/* 설명 박스 */}
          <div className="bg-[#4dc2c0] rounded-2xl p-5 mb-5">
            <h2 className="text-xl mb-2">{steps[currentStep].title}</h2>
            <p className="text-sm leading-relaxed opacity-90">
              {steps[currentStep].description}
            </p>
          </div>

          {/* 위치 인디케이터 */}
          <div className="mb-8 ml-5">
            <div
              className="w-12 h-12 bg-white rounded-full"
              style={{
                boxShadow: "0 0 15px 5px rgba(77, 194, 192, 0.5)",
              }}
            ></div>
          </div>

          {/* 하단 바 */}
          <div className="flex justify-center">
            <div className="w-[130px] h-[5px] bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

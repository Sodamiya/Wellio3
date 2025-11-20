"use client";

import { ArrowLeft, Star, ThumbsUp, Bot, ChevronDown } from "lucide-react";
import { Progress } from "./ui/progress";

interface Review {
  id: number;
  author: string;
  date: string;
  visitType: string;
  rating: number;
  likes: number;
  tags: string[];
  content: string;
}

interface HospitalReviewsPageProps {
  onBack: () => void;
  hospitalName?: string;
  reviews?: Review[];
}

export function HospitalReviewsPage({
  onBack,
  hospitalName = "매일건강의원",
  reviews = [],
}: HospitalReviewsPageProps) {
  // 리뷰 키워드 통계 데이터
  const reviewStats = [
    { label: "과잉진료가 없어요", percent: 96 },
    { label: "친절해요", percent: 92 },
    { label: "재진료 희망해요", percent: 77 },
  ];

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  return (
    <div className="relative min-h-screen bg-white flex flex-col max-w-[500px] mx-auto">
      {/* 1. 헤더 */}
      <header className="sticky top-0 z-20 bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-start -ml-2"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-bold text-[#1A1A1A] absolute left-1/2 -translate-x-1/2">
          {hospitalName}
        </h1>
        <div className="w-8" /> {/* 공간 채우기용 */}
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {/* 2. 상단 요약 섹션 */}
        <div className="px-5 pt-6 pb-8 border-b border-gray-100">
          <div className="flex gap-6 mb-6">
            {/* 왼쪽: 별점 */}
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <Star size={36} className="text-[#FFB800] fill-[#FFB800] mb-1" />
              <span className="text-[32px] font-bold text-gray-900 leading-none mt-1">
                {averageRating}
              </span>
              <span className="text-sm text-gray-400 mt-1">({reviews.length})</span>
            </div>

            {/* 오른쪽: 그래프 */}
            <div className="flex-1 space-y-3 pt-1">
              {reviewStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>{stat.label}</span>
                    <span className="text-gray-500">{stat.percent}%</span>
                  </div>
                  <Progress
                    value={stat.percent}
                    className="h-2 bg-gray-100 [&>div]:bg-[#6DD3CE]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI 요약 배너 */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[#36D2C5] text-sm font-bold">
              <Bot size={20} />
              <span>AI 웰리 요약</span>
            </div>
            <p className="text-[15px] font-bold text-gray-800">
              처방받은 약 효과가 좋다는 후기가 많아요
            </p>
          </div>
        </div>

        {/* 3. 필터 및 총 개수 */}
        <div className="px-5 py-4 flex items-center justify-between bg-white">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700">
            추천순 <ChevronDown size={16} />
          </button>
          <span className="text-sm text-gray-500 font-medium">총 {reviews.length}개</span>
        </div>

        {/* 4. 리뷰 리스트 */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">아직 작성된 리뷰가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-6">
                {/* 헤더: 별점, 유저정보, 좋아요 */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "fill-[#FFB800] text-[#FFB800]"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">
                        {review.author}
                      </span>
                      <span className="w-[1px] h-2.5 bg-gray-300"></span>
                      <span>{review.date}</span>
                      <span className="w-[1px] h-2.5 bg-gray-300"></span>
                      <span>{review.visitType}</span>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={16} />
                    <span className="text-sm">{review.likes}</span>
                  </button>
                </div>

                {/* 태그 */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-[6px] border border-[#36D2C5] text-[#36D2C5] text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 내용 */}
                <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

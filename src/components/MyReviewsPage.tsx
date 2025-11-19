"use client";

import { ArrowLeft, Star } from "lucide-react";

interface MyReviewsPageProps {
  onBack: () => void;
  reviews?: Review[];
}

interface Review {
  id: number;
  hospitalId: number;
  hospitalName: string;
  hospitalImage: string;
  visitDate: string;
  rating: number;
  keywords: string[];
  reviewText: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    hospitalId: 1,
    hospitalName: "서울대학교병원",
    hospitalImage: "https://example.com/hospital1.jpg",
    visitDate: "2024-11-15",
    rating: 5,
    keywords: ["친절해요", "전문적이에요", "시설이 깨끗해요"],
    reviewText: "의사선생님께서 정말 친절하시고 자세히 설명해주셔서 좋았습니다. 진료를 기다리는 동안 병원 시설도 깨끗하고 쾌적해서 만족스러웠어요.",
    userName: "김철수",
    userAvatar: "https://example.com/avatar1.jpg",
    createdAt: "2024-11-15T10:00:00Z"
  },
  {
    id: 2,
    hospitalId: 2,
    hospitalName: "강남세브란스병원",
    hospitalImage: "https://example.com/hospital2.jpg",
    visitDate: "2024-11-10",
    rating: 4,
    keywords: ["대기시간이 짧아요", "교통이 편리해요"],
    reviewText: "일요일인데도 진료를 받을 수 있어서 좋았습니다. 지하철역과 가까워서 접근성도 좋았어요.",
    userName: "이영희",
    userAvatar: "https://example.com/avatar2.jpg",
    createdAt: "2024-11-10T14:00:00Z"
  },
];

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export function MyReviewsPage({ onBack, reviews = mockReviews }: MyReviewsPageProps) {
  // 사용자가 작성한 리뷰가 있으면 그것을 표시하고, 없으면 목 데이터를 표시
  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  return (
    <div className="relative bg-[#F7F7F7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-4 flex items-center gap-4 border-b border-gray-100 w-full bg-white">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <span className="text-lg font-bold text-[#1A1A1A]">
          나의 후기
        </span>
      </header>

      {/* Content */}
      <div className="px-4 py-4 pb-20 space-y-4">
        {displayReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3"
          >
            {/* 첫번째줄: 병원이름 */}
            <div className="font-medium text-gray-900">
              {review.hospitalName}
            </div>

            {/* 두번째줄: 별점과 방문일 */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={
                      index < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{review.visitDate}</span>
            </div>

            {/* 세번째줄: 리뷰태그 (keywords) */}
            <div className="flex flex-wrap gap-2">
              {review.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#E8F8F7] text-[#36D2C5] rounded-full text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* 네번째줄: 리뷰내용 */}
            {review.reviewText && (
              <div className="text-sm text-gray-700 leading-relaxed">
                {review.reviewText}
              </div>
            )}

            {/* 작성일 */}
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              {formatDate(review.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MyReviewsPageProps {
  onBack: () => void;
  reviews?: Review[];
  onDeleteReview?: (id: number) => void;
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

export function MyReviewsPage({ onBack, reviews = mockReviews, onDeleteReview }: MyReviewsPageProps) {
  // 사용자가 작성한 리뷰가 있으면 그것을 표시하고, 없으면 목 데이터를 표시
  const [displayReviews, setDisplayReviews] = useState(reviews.length > 0 ? reviews : mockReviews);
  
  // 드래그 삭제 관련 state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const handleDragEnd = (event: any, info: any, reviewId: number) => {
    // 왼쪽으로 100px 이상 드래그하면 삭제 확인 모달 표시
    if (info.offset.x < -100) {
      setReviewToDelete(reviewId);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      if (onDeleteReview) {
        onDeleteReview(reviewToDelete);
      }
      setDisplayReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
    }
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

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
        <AnimatePresence>
          {displayReviews.map((review) => (
            <div key={review.id} className="relative">
              {/* 휴지통 배경 */}
              <div className="absolute inset-0 flex items-center justify-end pr-6 bg-red-500 rounded-2xl">
                <Trash2 size={24} className="text-white" />
              </div>
              
              {/* 드래그 가능한 리뷰 카드 */}
              <motion.div
                className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 relative"
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(event, info) => handleDragEnd(event, info, review.id)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
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
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelDelete}
            />
            
            {/* 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg mb-2">리뷰를 삭제하시겠습니까?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  삭제한 리뷰는 복구할 수 없습니다.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
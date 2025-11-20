"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Trash2,
  ChevronRight,
  Pencil,
  X,
  Check,
} from "lucide-react";
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
  visitType?: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    hospitalId: 1,
    hospitalName: "바른정형외과의원",
    hospitalImage: "https://example.com/hospital1.jpg",
    visitDate: "2025.08.05",
    rating: 5,
    keywords: [
      "회복이 빨라요",
      "친절해요",
      "과잉진료가 없어요",
    ],
    reviewText:
      "대기 많아서 대리접수 해드렸어요. 꾸준히 물리 받고 많이 좋아지셨습니다 첨엔 가만히 있어도 통증이 심했는데 3개월 정도 다녔는데 이제 통증도 없으시다고 하네요. 앞으로도 잘부탁드립니다",
    userName: "김철수",
    userAvatar: "https://example.com/avatar1.jpg",
    createdAt: "2024-11-15T10:00:00Z",
    visitType: "첫방문",
  },
  {
    id: 2,
    hospitalId: 2,
    hospitalName: "고운피부과",
    hospitalImage: "https://example.com/hospital2.jpg",
    visitDate: "2025.07.14",
    rating: 5,
    keywords: ["쾌적해요", "꼼꼼해요"],
    reviewText:
      "토닝이랑 재생관리 받으려고 방문했어요. 장비도 최신 모델링이고, 시술 과정도 꼼꼼해서 믿음이 갑니다.",
    userName: "이영희",
    userAvatar: "https://example.com/avatar2.jpg",
    createdAt: "2024-11-10T14:00:00Z",
    visitType: "첫방문",
  },
  {
    id: 3,
    hospitalId: 3,
    hospitalName: "오늘도강한내과의원",
    hospitalImage: "https://example.com/hospital3.jpg",
    visitDate: "2025.07.02",
    rating: 5,
    keywords: ["꼼꼼해요", "과잉진료가 없어요"],
    reviewText:
      "아빠 혈압약 받아왔습니다. 원장님 언제나 친절하고 좋으세요!",
    userName: "박민수",
    userAvatar: "https://example.com/avatar3.jpg",
    createdAt: "2024-10-25T12:00:00Z",
    visitType: "재방문",
  },
];

export function MyReviewsPage({
  onBack,
  reviews = mockReviews,
  onDeleteReview,
}: MyReviewsPageProps) {
  const [displayReviews, setDisplayReviews] = useState(
    reviews.length > 0 ? reviews : mockReviews,
  );

  const [expandedReviewId, setExpandedReviewId] = useState<
    number | null
  >(null);

  const [editingReviewId, setEditingReviewId] = useState<
    number | null
  >(null);
  const [editText, setEditText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (editingReviewId !== null && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editingReviewId, editText]);

  const handleCardClick = (id: number) => {
    // 수정 중일 때 다른 카드를 누르면 확인 팝업 표시
    if (editingReviewId !== null) {
      if (editingReviewId === id) return; // 본인(수정 중인 카드) 클릭 시 유지

      // 확인 창 표시
      const isConfirmed = window.confirm(
        "수정 중인 내용을 취소하고 다른 리뷰를 보시겠습니까?",
      );

      if (isConfirmed) {
        // 확인 시: 수정 취소 및 클릭한 카드 펼치기
        setEditingReviewId(null);
        setEditText("");
        setExpandedReviewId(id);
      }
      // 취소 시: 아무 동작 안 함 (수정 상태 유지)
      return;
    }

    // 일반 모드: 토글
    if (editingReviewId === id) return;
    setExpandedReviewId((prev) => (prev === id ? null : id));
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    id: number,
  ) => {
    e.stopPropagation();
    setReviewToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    review: Review,
  ) => {
    e.stopPropagation();
    setEditingReviewId(review.id);
    setEditText(review.reviewText);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReviewId(null);
    setEditText("");
  };

  const handleSaveEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDisplayReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, reviewText: editText } : r,
      ),
    );
    setEditingReviewId(null);
    setEditText("");
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      if (onDeleteReview) {
        onDeleteReview(reviewToDelete);
      }
      setDisplayReviews((prev) =>
        prev.filter((r) => r.id !== reviewToDelete),
      );
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

      <div className="px-4 py-4 pb-20">
        <AnimatePresence>
          {displayReviews.map((review) => {
            const isExpanded = expandedReviewId === review.id;
            const isEditing = editingReviewId === review.id;

            return (
              <motion.div
                key={review.id}
                className={`bg-white rounded-xl p-5 shadow-sm transition-colors relative flex flex-col overflow-hidden mb-3 ${isEditing ? "cursor-default" : "cursor-pointer hover:shadow-md"}`}
                onClick={() => handleCardClick(review.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 text-lg">
                      {review.hospitalName}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={
                          index < review.rating
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[#999999] text-[13px]">
                    <span className="ml-1">
                      {review.visitDate}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{review.visitType || "첫방문"}</span>
                  </div>
                </div>

                {review.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {review.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-white border border-[#36D2C5] text-[#36D2C5] rounded-[14px] text-[12px]"
                        style={{ borderRadius: "999px" }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* 리뷰 텍스트 및 입력창 영역 */}
                {isEditing ? (
                  <div
                    className="w-full mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      ref={textareaRef}
                      value={editText}
                      onChange={(e) =>
                        setEditText(e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg text-[15px] text-[#333333] leading-normal resize-none focus:outline-none focus:border-[#36D2C5] bg-gray-50 font-sans overflow-hidden"
                      style={{ minHeight: "48px" }}
                    />
                  </div>
                ) : (
                  review.reviewText && (
                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? "auto" : 48,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="text-[15px] text-[#333333] leading-normal overflow-hidden"
                    >
                      <p>{review.reviewText}</p>
                    </motion.div>
                  )
                )}

                {/* 버튼 영역 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                        marginTop: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        marginTop: 12,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        marginTop: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`flex justify-end gap-3 ${isEditing ? "mt-2" : "pt-1"}`}
                      >
                        {isEditing ? (
                          // [수정] 수정/삭제 버튼과 동일한 스타일(배경X, 아이콘+텍스트)로 변경
                          <>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm py-1 px-1 transition-colors"
                            >
                              <X size={14} />
                              <span>취소</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleSaveEdit(e, review.id)
                              }
                              className="flex items-center gap-1 text-[#36D2C5] hover:text-[#2bb5aa] text-sm py-1 px-1 transition-colors font-medium"
                            >
                              <Check size={14} />
                              <span>완료</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) =>
                                handleEditClick(e, review)
                              }
                              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm py-1 px-1 transition-colors"
                            >
                              <Pencil size={14} />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeleteClick(e, review.id)
                              }
                              className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm py-1 px-1 transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>삭제</span>
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelDelete}
            />

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
                <h3 className="text-lg mb-2">
                  리뷰를 삭제하시겠습니까?
                </h3>
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
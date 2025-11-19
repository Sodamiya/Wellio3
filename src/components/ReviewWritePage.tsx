"use client";

import { ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface ReviewWritePageProps {
  onBack: () => void;
  onComplete?: (reviewData: {
    hospitalId: number;
    hospitalName: string;
    hospitalImage: string;
    visitDate: string;
    rating: number;
    keywords: string[];
    reviewText: string;
    userName: string;
    userAvatar: string;
  }) => void;
  hospitalName?: string;
  visitDate?: string;
  hospitalImage?: string;
  userName?: string;
  hospitalId?: number;
}

const KEYWORDS = [
  "예약이 쉬워요",
  "주차 편해요",
  "꼼꼼해요",
  "회복이 빨라요",
  "친절해요",
  "쾌적해요",
  "진료 만족해요",
  "재진료 희망해요",
  "과잉진료가 없어요",
];

export function ReviewWritePage({
  onBack,
  onComplete,
  hospitalName = "매일건강의원",
  visitDate = "2025.08.11(월) 14:00",
  hospitalImage,
  userName = "사용자",
  hospitalId = 1,
}: ReviewWritePageProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<
    string[]
  >([]);
  const [reviewText, setReviewText] = useState("");

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      // 이미 선택된 키워드를 클릭하면 제거
      setSelectedKeywords(
        selectedKeywords.filter((k) => k !== keyword),
      );
    } else {
      // 새로운 키워드 선택 (최대 3개)
      if (selectedKeywords.length < 3) {
        setSelectedKeywords([...selectedKeywords, keyword]);
      } else {
        toast.error(
          "키워드는 최대 3개까지 선택할 수 있습니다.",
        );
      }
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    // 리뷰 제출 로직
    toast.success("리뷰가 작성되었습니다!");
    
    if (onComplete) {
      onComplete({
        hospitalId,
        hospitalName,
        hospitalImage: hospitalImage || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop",
        visitDate,
        rating,
        keywords: selectedKeywords,
        reviewText,
        userName,
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
      });
    } else {
      onBack();
    }
  };

  // 폼 유효성 검사: 별점 선택, 키워드 1개 이상 필수
  const isFormValid = rating > 0 && selectedKeywords.length >= 1;

  return (
    <div className="relative bg-[#F7F7F7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-4 flex items-center gap-4 border-b border-gray-100 w-full bg-white">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
          className="w-6 h-6 flex items-center justify-center"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <span className="text-lg text-[#1A1A1A] flex-1 text-center mr-6">
          리뷰 작성
        </span>
      </header>

      {/* Content */}
      <div className="pb-32 px-4">
        {/* 병원 정보 카드 */}
        <div className="flex items-center bg-white p-4 my-4 rounded-xl shadow-sm">
          <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mr-4">
            <ImageWithFallback
              src={
                hospitalImage ||
                "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop"
              }
              alt={hospitalName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[#1A1A1A] mb-1">
              {hospitalName}
            </p>
            <p className="text-sm text-gray-500">{visitDate}</p>
          </div>
        </div>

        {/* 별점 선택 영역 */}
        <div className="bg-white p-5 mb-4 rounded-xl shadow-sm text-center">
          <h3 className="text-gray-700 mb-4">
            별점을 선택해 주세요.
          </h3>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? "fill-[#FFB800] text-[#FFB800]"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 키워드 선택 영역 */}
        <div className="bg-white p-4 mb-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#1A1A1A]">키워드 선택</h3>
            <span
              className={`${
                selectedKeywords.length === 3
                  ? "text-[#36D2C5]"
                  : "text-gray-500"
              }`}
            >
              {selectedKeywords.length}/3
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleKeywordClick(keyword)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedKeywords.includes(keyword)
                    ? "bg-[#36D2C5] text-white border-[#36D2C5]"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-[#36D2C5]"
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 리뷰 텍스트 영역 */}
        <div>
          <div className="text-xs text-gray-600 mb-3 p-3 bg-gray-100 rounded-lg leading-relaxed">
            모든 리뷰는 확인 후 반영됩니다.
            <br />
            진료와 무관한 내용이나 부정확한 정보는 노출되지 않을
            수 있어요.
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                setReviewText(e.target.value);
              }
            }}
            placeholder="선택하신 키워드를 바탕으로 후기를 작성해주세요."
            className="w-full h-[150px] p-4 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:border-[#36D2C5] transition-colors"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {reviewText.length} / 400
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto p-4 pb-8 bg-white border-t border-gray-100 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl text-white transition-all ${
            isFormValid
              ? "bg-[#36D2C5] hover:bg-[#2FC0B3] cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
}
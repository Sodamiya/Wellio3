import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

// 임시 데이터 (나중에 실제 데이터로 교체)
const articles = [
  {
    id: 1,
    imageSrc:
      "https://via.placeholder.com/260x160/F0FDF4/888?text=Article+Image+1",
    title: "혹시 나도 디스크?",
    description:
      "시도 때도 없이 찌릿거리는 허리, 혹시 디스크가 아닌 지 확인해보세요",
    bgColor: "bg-lime-50", // 이미지 배경색
  },
  {
    id: 2,
    imageSrc:
      "https://via.placeholder.com/260x160/F0F9FF/888?text=Article+Image+2",
    title: "현대인의 편두통",
    description: "지긋지긋한 편두통, 간단한 마사지로...",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    imageSrc:
      "https://via.placeholder.com/260x160/FFFBEB/888?text=Article+Image+3",
    title: "환절기 비염",
    description: "코막힘과 재채기, 알레르기 비염 관리법",
    bgColor: "bg-yellow-50",
  },
];

// 개별 아티클 카드
function ArticleCard({
  article,
}: {
  article: (typeof articles)[0];
}) {
  return (
    <div className="w-[260px]">
      {/* TODO: 나중에 이 div를 실제 이미지로 교체하세요 */}
      <div
        className={`w-full h-40 rounded-lg ${article.bgColor} overflow-hidden`}
      >
        <img
          src={article.imageSrc}
          alt={article.title}
          className="w-full h-full object-cover opacity-30" // 임시 이미지 스타일
        />
      </div>
      <div className="mt-3">
        <h4 className="font-semibold text-gray-800">
          {article.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1 truncate">
          {article.description}
        </p>
      </div>
    </div>
  );
}

// 건강지식 섹션 메인 컴포넌트
export function HealthKnowledge() {
  return (
    <div className="w-full overflow-hidden">
      {/* 1. 타이틀 (건강지식 / 전체보기) */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 md:px-8">
        <h3 className="text-lg font-bold text-gray-900">
          건강지식
        </h3>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-800">
          전체보기 {'>'}
        </button>
      </div>

      {/* 2. Swiper 가로 스크롤 영역 - 모바일용 */}
      <div className="block md:hidden pl-4 sm:pl-6">
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor={true}
          className="!overflow-visible"
        >
          {articles.map((article) => (
            <SwiperSlide key={article.id} style={{ width: '260px' }}>
              <ArticleCard article={article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 3. 그리드 레이아웃 - 태블릿/데스크톱용 */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 px-4 sm:px-6 md:px-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
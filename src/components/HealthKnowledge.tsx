import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// 임시 데이터
const articles = [
  {
    id: 1,
    imageSrc:
      "https://images.unsplash.com/photo-1584515933487-9d90070a94b8?w=400&q=80",
    title: "혹시 나도 디스크?",
    description:
      "시도 때도 없이 찌릿거리는 허리, 혹시 디스크가 아닌 지 확인해보세요",
    bgColor: "bg-lime-50",
  },
  {
    id: 2,
    imageSrc:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    title: "현대인의 편두통",
    description:
      "지긋지긋한 편두통, 간단한 마사지로 완화하는 방법",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    imageSrc:
      "https://images.unsplash.com/photo-1616012613235-2942f7c6773f?w=400&q=80",
    title: "환절기 비염",
    description:
      "코막힘과 재채기, 알레르기 비염 관리법을 알아보세요",
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
    // [수정] w-[260px] -> w-full (SwiperSlide 너비에 맞춤)
    <div className="w-full">
      <div
        className={`w-full h-40 rounded-2xl ${article.bgColor} overflow-hidden relative`}
      >
        {/* 이미지에 오버레이 효과 추가해서 텍스트 가독성 확보 (선택사항) */}
        <img
          src={article.imageSrc}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-3">
        <h4 className="font-bold text-gray-900 text-lg">
          {article.title}
        </h4>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {article.description}
        </p>
      </div>
    </div>
  );
}

// 건강지식 섹션 메인 컴포넌트
export function HealthKnowledge() {
  return (
    <div className="w-full overflow-hidden pb-10">
      {/* 1. 타이틀 (건강지식 / 전체보기) */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 md:px-8">
        <h3 className="text-lg font-bold text-gray-900">
          건강지식
        </h3>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-800">
          전체보기 {">"}
        </button>
      </div>

      {/* 2. Swiper 가로 스크롤 영역 - 항상 표시되도록 수정 */}
      {/* [수정] block md:hidden 클래스 제거 -> 항상 보임 */}
      <div className="pl-4 sm:pl-6 md:pl-8">
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor={true}
          className="!overflow-visible"
        >
          {articles.map((article) => (
            // [중요] SwiperSlide에 고정 너비 지정 (260px)
            <SwiperSlide
              key={article.id}
              style={{ width: "260px" }}
            >
              <ArticleCard article={article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* [삭제] 3. 그리드 레이아웃 (PC용) - 제거함
          이유: 컨테이너가 500px로 고정되어 있어 그리드가 깨짐
      */}
    </div>
  );
}
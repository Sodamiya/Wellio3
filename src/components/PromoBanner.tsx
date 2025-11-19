"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function PromoBanner() {
  const [banners] = useState([
    {
      id: 1,
      title: "건강검진 예약 시",
      description: "최대 30% 할인 혜택",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&q=80",
      bgColor: "from-[#4EC7FF] to-[#36D2C5]",
    },
    {
      id: 2,
      title: "약 배송 서비스",
      description: "집 앞까지 무료 배송",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80",
      bgColor: "from-[#FF6B9D] to-[#C44569]",
    },
    {
      id: 3,
      title: "24시간 원격 상담",
      description: "의사와 실시간 채팅",
      image:
        "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200&q=80",
      bgColor: "from-[#A8E6CF] to-[#56AB91]",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const augmentedBanners = [
    banners[banners.length - 1],
    ...banners,
    banners[0],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const transitionEndTimer = setTimeout(() => {
      if (currentIndex === banners.length) {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }
    }, 500);

    return () => clearTimeout(transitionEndTimer);
  }, [currentIndex, banners.length]);

  const transformStyle = {
    transform: `translateX(-${(currentIndex + 1) * 100}%)`,
  };

  return (
    <div className="relative h-[80px] overflow-hidden rounded-2xl">
      {/* 배너 슬라이드 */}
      <div
        className={`flex h-full ${
          isTransitioning
            ? "transition-transform duration-500 ease-in-out"
            : "transition-none"
        }`}
        style={transformStyle}
      >
        {augmentedBanners.map((banner, index) => (
          <div
            key={index}
            className={`min-w-full h-full bg-gradient-to-br ${banner.bgColor} relative overflow-hidden`}
          >
            {/* ... (배너 컨텐츠는 동일) ... */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/10 rounded-full translate-y-8" />
            <div className="relative z-10 h-full flex items-center justify-between pl-6 pr-3">
              <div className="flex-1">
                <h3 className="text-white mb-1">
                  {banner.title}
                </h3>
                <p className="text-white/90">
                  {banner.description}
                </p>
              </div>
              <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 ml-4">
                <ImageWithFallback
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 점 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index);
            }}
            // --- [수정] ---
            // 'index === currentIndex'
            // -> 'index === (currentIndex % banners.length)'
            //
            // (currentIndex가 3이 되어도 3 % 3 = 0 이므로 0번 점이 활성화됨)
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex % banners.length
                ? "bg-white w-6"
                : "bg-white/50 w-1.5"
            }`}
            aria-label={`배너 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
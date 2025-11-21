"use client";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronRight,
  ClipboardList,
  ThumbsUp,
  CheckCircle2,
  Bot,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DoctorCard } from "./DoctorCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useEffect, useRef, useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

// 👇 발급받은 키를 여기에 유지해주세요
const KAKAO_MAP_API_KEY = "ee7ef6c37b67c27768d7dcb2f13f0a83";

interface Hospital {
  id: number;
  name: string;
  department: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

interface HospitalDetailPageProps {
  hospital: Hospital;
  onBack: () => void;
  onReviewsClick?: () => void;
  reviewCount?: number;
  averageRating?: number;
  keywordStats?: Array<{ keyword: string; count: number; percentage: number }>;
  previewReviews?: Array<{
    id: number;
    author: string;
    date: string;
    rating: number;
    tags: string[];
    content: string;
    likes: number;
  }>;
}

export function HospitalDetailPage({
  hospital,
  onBack,
  onReviewsClick,
  reviewCount = 0,
  averageRating = 0,
  keywordStats = [],
  previewReviews = [],
}: HospitalDetailPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 미리보기용 리뷰 데이터 (3개만 표시)
  const userReviews = previewReviews.length > 0 ? previewReviews.slice(0, 3) : [
    {
      id: 1,
      author: "김**님",
      date: "2025.05.22",
      rating: 5,
      tags: ["진료 만족해요", "친절해요"],
      content: "목이 아프고 근육통이 심해서 방문했는데 친절하게 진료 잘 봐주셔서 좋았습니다!",
      likes: 6,
    },
    {
      id: 2,
      author: "박**님",
      date: "2025.01.29",
      rating: 5,
      tags: ["진료 만족해요", "재진료 희망해요", "친절해요"],
      content: "만족스러운 첫 방문! 이사 와서 처음 방문했는데, 앞으로 꾸준히 다닐 것 같습니다.",
      likes: 15,
    },
    {
      id: 3,
      author: "이**님",
      date: "2024.12.10",
      rating: 4,
      tags: ["대기시간이 짧아요", "친절해요"],
      content: "항상 친절하게 맞아주셔서 감사합니다. 대기 시간이 짧아서 바쁜 직장인에게 딱이에요.",
      likes: 2,
    },
  ];

  // 1. 카카오맵 스크립트 로드 (표준 방식)
  useEffect(() => {
    if (
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.services
    ) {
      setIsMapLoaded(true);
      return;
    }

    const scriptId = "kakao-map-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (
        window.kakao &&
        window.kakao.maps &&
        window.kakao.maps.services
      ) {
        setIsMapLoaded(true);
      } else {
        existingScript.addEventListener("load", () =>
          setIsMapLoaded(true),
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true);
      });
    };

    document.head.appendChild(script);
  }, []);

  // 2. 맵 그리기 & 주소 검색 (디버그 로그 제거됨)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // 지도 생성
    const mapOption = {
      center: new window.kakao.maps.LatLng(
        37.566826,
        126.9786567,
      ), // 기본값
      level: 3,
    };
    const map = new window.kakao.maps.Map(
      mapRef.current,
      mapOption,
    );

    // 주소 검색 (Geocoding)
    if (window.kakao.maps.services) {
      const geocoder =
        new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(
        hospital.address,
        function (result: any, status: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x,
            );

            const marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            map.setCenter(coords);
          } else {
            // 검색 실패 시 데이터 좌표 사용
            if (hospital.latitude && hospital.longitude) {
              const coords = new window.kakao.maps.LatLng(
                hospital.latitude,
                hospital.longitude,
              );
              new window.kakao.maps.Marker({
                map: map,
                position: coords,
              });
              map.setCenter(coords);
            }
          }
        },
      );
    }
  }, [
    isMapLoaded,
    hospital.address,
    hospital.latitude,
    hospital.longitude,
  ]);

  const handleDirections = () => {
    const lat = hospital.latitude;
    const lng = hospital.longitude;

    if (lat && lng) {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${lat},${lng}`,
        "_blank",
      );
    } else {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)}`,
        "_blank",
      );
    }
  };

  const doctors = [
    {
      id: 1,
      name: "박진희 의사",
      specialty: "가정의학과 전문의",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    },
    {
      id: 2,
      name: "김민수 의사",
      specialty: "내과 전문의",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    },
    {
      id: 3,
      name: "이영희 의사",
      specialty: "소아청소년과 전문의",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    },
  ];

  const medicalSubjects = [
    "가정의학과",
    "내과",
    "소아청소년과",
    "피부과",
    "정신건강의학과",
    "노인진료과",
  ];

  return (
    <div className="relative min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 sm:px-6 md:px-8 py-4 flex items-center border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center mr-4"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">
          {hospital.name}
        </h1>
      </header>

      <main className="flex-1 pb-32 overflow-y-auto">
        {/* Top Image Area */}
        <div className="w-full h-[240px] md:h-[320px] overflow-hidden bg-gray-200">
          <ImageWithFallback
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hospital Main Info Card */}
        <div className="relative z-10 mx-4 sm:mx-6 md:mx-8 -mt-20">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            {/* Title Row */}
            <div className="flex items-end gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-none">
                {hospital.name}
              </h2>
              <span className="text-gray-500 text-sm mb-0.5 font-medium">
                {hospital.department}
              </span>
            </div>

            {/* Time Row */}
            <div className="flex items-center gap-1.5 mb-3">
              <Clock size={18} className="text-gray-400" />
              <span className="text-[#36D2C5] font-bold text-sm">
                오늘 진료
              </span>
              <span className="text-gray-700 text-sm">
                {hospital.hours}
              </span>
            </div>

            {/* Address Row */}
            <div className="mb-6">
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {hospital.address}
              </p>
            </div>

            {/* Button */}
            <button className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              병원정보 자세히보기
            </button>
          </div>
        </div>

        {/* Insurance Banner */}
        <div className="mx-4 sm:mx-6 md:mx-8 mt-4 bg-[#E7F3FF] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              원클릭 실손보험 연동하기
            </h3>
            <p className="text-sm text-gray-700">
              진료비 10초 만에 청구 완료!
            </p>
          </div>
          <ClipboardList size={24} className="text-blue-500" />
        </div>

        {/* 1. 진료 과목 */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            진료 과목
          </h3>
          <div className="flex flex-wrap gap-2">
            {medicalSubjects.map((subject) => (
              <span
                key={subject}
                className="bg-[#F4F5F7] text-[#4B5563] px-3.5 py-2 rounded-lg text-[15px] font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* 2. 의사 정보 */}
        <div className="mt-8">
          <div className="px-4 sm:px-6 md:px-8 mb-3 ml-1">
            <h3 className="text-lg font-bold text-gray-900">
              의사 정보
            </h3>
          </div>
          <div>
            <Swiper
              slidesPerView="auto"
              spaceBetween={12}
              className="!px-4 sm:!px-6"
            >
              {doctors.map((doctor) => (
                <SwiperSlide
                  key={doctor.id}
                  style={{ width: "263px" }}
                >
                  <DoctorCard doctor={doctor} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 3. 병원 위치 */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            병원 위치
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 지도 영역 */}
            <div
              ref={mapRef}
              className="w-full h-[200px] bg-gray-100"
            />
            <div className="p-5">
              <p className="text-lg font-bold text-gray-900 leading-snug mb-3">
                {hospital.address}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#BDB092] text-white text-[10px] font-bold shrink-0">
                  9
                </span>
                <span className="flex items-center justify-center h-5 px-1.5 rounded bg-[#D4003B] text-white text-[10px] font-bold shrink-0">
                  신분당선
                </span>
                <span>신논현역 7번출구에서 214m</span>
              </div>
              <Button
                onClick={handleDirections}
                variant="outline"
                className="w-full h-12 text-gray-600 border-gray-200 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                길찾기
              </Button>
            </div>
          </div>
        </div>

        {/* 4. 병원 후기 */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            병원 후기
          </h3>

          {/* 요약 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
            <div className="flex gap-6 mb-6">
              <div className="flex flex-col items-center justify-center min-w-[80px]">
                <Star
                  size={32}
                  className="text-[#FFB800] fill-[#FFB800] mb-1"
                />
                <span className="text-3xl font-bold text-gray-900">
                  {averageRating}
                </span>
                <span className="text-sm text-gray-500">
                  ({reviewCount})
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {keywordStats.map((item) => (
                  <div key={item.keyword} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{item.keyword}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <Progress
                      value={item.percentage}
                      className="h-2 bg-gray-100 [&>div]:bg-[#6DD3CE]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF8F8] rounded-xl p-4 flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1.5 text-[#36D2C5] text-sm font-bold mb-1">
                <Bot size={18} />
                <span>AI 웰리 요약</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                처방받은 약 효과가 좋다는 후기가 많아요
              </p>
            </div>
          </div>

          {/* 인증 배너 */}
          <div className="bg-[#F0F0F0] rounded-lg py-2.5 px-4 flex items-center justify-center gap-1.5 mb-3 text-gray-500 text-xs">
            <CheckCircle2 size={14} />
            <span>
              웰리오는 방문이 인증된 후기만 제공하고 있습니다
            </span>
          </div>

          {/* 리뷰 리스트 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <button className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700">
                인기순 <ChevronDown size={14} />
              </button>
            </div>

            <div className="space-y-6">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < review.rating
                              ? "text-[#FFB800] fill-[#FFB800]"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        {review.author} | {review.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <ThumbsUp size={14} />
                      <span>{review.likes}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {review.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-[#36D2C5] border border-[#36D2C5] px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 h-12 text-gray-600 border-gray-200 rounded-xl hover:bg-gray-50"
              onClick={onReviewsClick}
            >
              {reviewCount - 3}개 리뷰 더보기
            </Button>
          </div>
        </div>

        {/* 5. 병원 접수 안내 */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            병원 접수 안내
          </h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <ul className="list-disc list-outside space-y-2 pl-5 text-sm text-gray-600 leading-relaxed">
              <li>
                [즉시 접수] 후 병원 방문 시 꼭 성함과 함께
                접수처에 말씀해 주세요.
              </li>
              <li>
                접수 후 30분 이내로 미방문 시 자동으로 접수가
                취소됩니다. 주의 부탁드립니다.
              </li>
              <li>
                현장 접수 하시는 분들로 인하여 대기 현황 및 접수
                순서는 다를 수 있으니 양해 부탁드립니다.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-white border-t border-gray-100 max-w-[500px] mx-auto">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg font-bold border-2 border-[#36D2C5] text-[#36D2C5] bg-white hover:bg-gray-50 rounded-xl"
          >
            예약하기
          </Button>
          <Button className="flex-1 h-14 text-lg font-bold bg-[#36D2C5] hover:bg-[#00C2B3] text-white rounded-xl">
            즉시 접수
          </Button>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}
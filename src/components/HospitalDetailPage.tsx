"use client";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DoctorCard } from "./DoctorCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useEffect, useRef, useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

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
}

export function HospitalDetailPage({
  hospital,
  onBack,
}: HospitalDetailPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // 카카오맵 스크립트 동적 로딩
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setIsMapLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="dapi.kakao.com"]',
      );

      if (existingScript) {
        const checkKakao = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(checkKakao);
            setIsMapLoaded(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkKakao);
          if (!window.kakao || !window.kakao.maps) {
            setMapError(true);
          }
        }, 5000);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=ee7ef6c37b67c27768d7dcb2f13f0a83&autoload=false`;
      script.type = "text/javascript";

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setIsMapLoaded(true);
          });
        } else {
          setMapError(true);
        }
      };

      script.onerror = () => {
        setMapError(true);
      };

      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    try {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(
          hospital.latitude || 37.5665,
          hospital.longitude || 126.978,
        ),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);

      const markerPosition = new window.kakao.maps.LatLng(
        hospital.latitude || 37.5665,
        hospital.longitude || 126.978,
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(map);
    } catch (error) {
      console.error("카카오맵 초기화 실패:", error);
    }
  }, [isMapLoaded, hospital.latitude, hospital.longitude]);

  const handleDirections = () => {
    const lat = hospital.latitude || 37.5665;
    const lng = hospital.longitude || 126.978;
    window.open(
      `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${lat},${lng}`,
      "_blank",
    );
  };

  const doctors = [
    {
      id: 1,
      name: "김건강 원장",
      specialty: "내과 전문의",
      experience: "경력 15년",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    },
    {
      id: 2,
      name: "이웰니스 원장",
      specialty: "가정의학과 전문의",
      experience: "경력 12년",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    },
    {
      id: 3,
      name: "박진료 원장",
      specialty: "내과 전문의",
      experience: "경력 10년",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    },
  ];

  const reviewKeywords = [
    { label: "친절해요", percent: 92 },
    { label: "진료를 잘해요", percent: 85 },
    { label: "시설이 깨끗해요", percent: 77 },
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
        <div className="relative z-10 mx-4 sm:mx-6 md:mx-8 -mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {hospital.name}
            </h2>
            <p className="text-base text-gray-600 mb-4">
              {hospital.department}
            </p>

            <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <Clock
                  size={20}
                  className="text-[#36D2C5] flex-shrink-0"
                />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">진료중</span>{" "}
                  {hospital.hours}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="text-[#36D2C5] flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-gray-700">
                  {hospital.address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone
                  size={20}
                  className="text-[#36D2C5] flex-shrink-0"
                />
                <p className="text-sm text-gray-700">
                  {hospital.phone}
                </p>
              </div>
            </div>

            <button className="flex justify-between items-center w-full text-sm font-medium text-gray-700">
              <span>진료과목 상세보기</span>
              <ChevronRight size={16} />
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

        {/* 1. 진료 과목 (카드형) */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            진료 과목
          </h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                "내과",
                "소아청소년과",
                "피부과",
                "정형외과",
                "이비인후과",
              ].map((subject) => (
                <span
                  key={subject}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 의료진 소개 (타이틀 밖으로, 카드 유지) */}
        <div className="mt-8">
          <div className="px-4 sm:px-6 md:px-8 mb-3 ml-1">
            <h3 className="text-lg font-bold text-gray-900">
              의료진 소개
            </h3>
          </div>

          {/* 모바일: Swiper (배경색 제거) */}
          <div className="md:hidden">
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

          {/* 태블릿/데스크톱: 그리드 */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 px-4 sm:px-6 md:px-8">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>

        {/* 3. 오시는 길 (카드형) */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">
            오시는 길
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div
              ref={mapRef}
              className="w-full h-[200px] bg-gray-100"
            />
            <div className="p-5">
              <div className="border border-gray-200 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {hospital.address}
                </p>
                <p className="text-xs text-gray-500">
                  {hospital.phone}
                </p>
              </div>
              <Button
                onClick={handleDirections}
                className="w-full h-12 bg-gray-800 text-white font-semibold hover:bg-gray-900 rounded-xl"
              >
                길찾기
              </Button>
            </div>
          </div>
        </div>

        {/* 4. 병원 후기 (카드형) */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-3 ml-1">
            <h3 className="text-lg font-bold text-gray-900">
              병원 후기
            </h3>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-800">
              전체보기
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Star
                  size={20}
                  className="text-[#FFB800] fill-[#FFB800]"
                />
                <span className="text-2xl font-bold text-gray-900">
                  4.8
                </span>
                <span className="text-sm text-gray-500">
                  (223개)
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                이 병원은{" "}
                <span className="text-red-500 font-semibold">
                  90%
                </span>
                가 만족했어요
              </p>
              <div className="space-y-2">
                {reviewKeywords.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-3 items-center gap-2"
                  >
                    <span className="text-xs text-gray-600 truncate">
                      {item.label}
                    </span>
                    <div className="col-span-2">
                      <Progress
                        value={item.percent}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-[#FFB800] fill-[#FFB800]"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-2">
                김*강님 | 2025.11.18
              </p>
              <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                의사 선생님이 정말 친절하시고, 설명도 꼼꼼하게
                잘 해주셔서 좋았습니다. 병원 내부도 깨끗하고...
              </p>
            </div>
          </div>
        </div>

        {/* 5. 병원 접수 안내 (카드형) */}
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
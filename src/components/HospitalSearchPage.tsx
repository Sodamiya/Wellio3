import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { HospitalCard } from "./HospitalCard"; // 수정된 HospitalCard 임포트

interface HospitalSearchPageProps {
  onBack: () => void;
  onHospitalClick: (hospital: any) => void;
  favoriteHospitals: any[];
  onToggleFavorite: (hospital: any) => void;
}

export function HospitalSearchPage({
  onBack,
  onHospitalClick,
  favoriteHospitals,
  onToggleFavorite,
}: HospitalSearchPageProps) {
  const [selectedFilter, setSelectedFilter] =
    useState("거리순");

  const filters = [
    "거리순",
    "진료종",
    "즉시접수",
    "야간진료",
    "약/주사",
  ];

  // hospital 데이터는 변경 없음
  const hospitals = [
    {
      id: 1,
      name: "매일건강의원",
      department: "가정의학과",
      specialtyText: "가정의학과와 전문의 2명",
      hours: "10:00-20:00",
      distance: "37m",
      address: "서울 서초구 서초대로 59번길 19, 201호",
      phone: "02-1234-5678",
      description: "환자 중심의 진료를 제공하는 가정의학과 전문 병원입니다. 만성질환 관리부터 건강검진까지 종합적인 의료 서비스를 제공합니다.",
      isAvailableNow: true,
      rating: 4.8,
      reviews: 223,
      imageUrl:
        "https://images.unsplash.com/photo-1580281658136-17c835359e86?w=100&h=100&fit=crop",
      latitude: 37.4949,
      longitude: 127.0283,
    },
    {
      id: 2,
      name: "365클리닉 강남본점",
      department: "피부과",
      specialtyText: "피부과와 전문의 3명",
      hours: "09:30-20:30",
      distance: "58m",
      address: "서울 서초구 서초대로 16가길, 3층",
      phone: "02-2345-6789",
      description: "최신 피부과 시술 장비를 갖춘 전문 클리닉입니다. 여드름, 미백, 안티에이징 등 다양한 피부 치료를 제공합니다.",
      isAvailableNow: true,
      rating: 4.6,
      reviews: 12,
      imageUrl:
        "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      latitude: 37.4950,
      longitude: 127.0285,
    },
    {
      id: 3,
      name: "사랑니쏙쏙 강남본점",
      department: "치과",
      specialtyText: "치과",
      hours: "10:00-18:00",
      distance: "167m",
      address: "서울 서초구 강남대로 102",
      phone: "02-3456-7890",
      description: "사랑니 발치 전문 치과입니다. 통증 최소화와 빠른 회복을 위한 최신 시술 방법을 사용합니다.",
      isAvailableNow: true,
      rating: 4.7,
      reviews: 41,
      imageUrl:
        "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      latitude: 37.4955,
      longitude: 127.0290,
    },
    {
      id: 4,
      name: "강남예쁜이치과의원",
      department: "치과",
      specialtyText: "치과",
      hours: "09:00-19:00",
      distance: "720m",
      address: "서울시 강남구 선릉로 345",
      phone: "02-4567-8901",
      description: "심미 치과 치료를 전문으로 하는 치과입니다. 라미네이트, 임플란트 등 다양한 치료를 제공합니다.",
      isAvailableNow: false,
      rating: 4.7,
      reviews: 312,
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      latitude: 37.4960,
      longitude: 127.0295,
    },
  ];

  return (
    <div className="bg-white flex flex-col">
      {/* Header: sticky, z-10, bg-white, border-b 유지 */}
      <header className="sticky top-0 z-10 bg-white px-4 sm:px-6 md:px-8 pt-4 pb-2 space-y-4 border-b border-gray-100">
        {/* Title Bar */}
        <div className="flex items-center justify-between pb-2">
          <button onClick={onBack} className="w-10 p-2 -ml-2">
            <ArrowLeft size={24} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A] text-center flex-1">
            병원 찾기
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="진료과, 병원이름을 검색해보세요"
              className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-gray-400"
            />
          </div>
          <button className="text-[#1A1A1A] text-sm font-medium">
            취소
          </button>
        </div>

        {/* ⭐️ [수정] Filter Tags: 'scrollbar-hide' 클래스 제거. 플러그인이 없을 경우 오류 방지. */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${
                selectedFilter === filter
                  ? "bg-[#E7F3FF] text-[#2F80ED]" // 시안과 일치
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Hospital List: 내부 스크롤 방지 유지 */}
      <div className="overflow-y-hidden">
        <div className="grid grid-cols-1">
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onClick={() => onHospitalClick(hospital)}
              favoriteHospitals={favoriteHospitals}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
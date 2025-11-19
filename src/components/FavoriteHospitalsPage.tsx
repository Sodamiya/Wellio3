"use client";

import { ArrowLeft } from "lucide-react";
import { HospitalCard } from "./HospitalCard";

interface FavoriteHospitalsPageProps {
  onBack: () => void;
  favoriteHospitals: any[];
  onToggleFavorite: (hospital: any) => void;
}

export function FavoriteHospitalsPage({ onBack, favoriteHospitals, onToggleFavorite }: FavoriteHospitalsPageProps) {
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
          찜한 병원
        </span>
      </header>

      {/* Content */}
      <div className="pb-20">
        {favoriteHospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500">찜한 병원이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">병원 검색에서 하트를 눌러 저장해보세요</p>
          </div>
        ) : (
          favoriteHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              isInFavoritePage={true} // 찜한 병원 페이지임을 표시
              onClick={() => {
                // 병원 상세 페이지로 이동하는 로직 추가 가능
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
import { Heart, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

// 카드 데이터 인터페이스 (이전과 동일)
interface Hospital {
  id: number;
  name: string;
  specialtyText: string;
  hours: string;
  distance: string;
  address: string;
  isAvailableNow: boolean;
  rating: number;
  reviews: number;
  imageUrl: string;
}

interface HospitalCardProps {
  hospital: Hospital;
  onClick?: () => void;
  isFavorite?: boolean;
  favoriteHospitals?: any[];
  onToggleFavorite?: (hospital: any) => void;
  isInFavoritePage?: boolean; // 찜한 병원 페이지에서 사용 중인지 여부
}

export function HospitalCard({ hospital, onClick, isFavorite, favoriteHospitals, onToggleFavorite, isInFavoritePage }: HospitalCardProps) {
  // isFavorite prop이 전달되면 그것을 사용, 아니면 favoriteHospitals에서 확인
  const isHospitalFavorite = isFavorite !== undefined 
    ? isFavorite 
    : favoriteHospitals?.some(h => h.id === hospital.id) || false;

  return (
    <div
      onClick={onClick}
      className="flex flex-col bg-white p-4 border-b border-gray-100 last:border-b-0 md:border md:rounded-2xl md:shadow-sm md:m-2 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {/* 1. 상단 정보: 이미지, 이름, 전문의, 하트 */}
      <div className="flex gap-4">
        {/* [수정] 이미지 크기 w-12 h-12 (48px)로 변경, 반응형 제거 */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <ImageWithFallback
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 이름, 전문의, 하트 */}
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {hospital.name}
            </h3>
            <button
              className={`transition-colors ${
                isHospitalFavorite 
                  ? "text-red-500 fill-red-500" 
                  : "text-gray-300 hover:text-red-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                
                // 찜한 병원 페이지에서 찜 해제 시 확인 팝업 표시
                if (isInFavoritePage && isHospitalFavorite) {
                  const confirmed = window.confirm(`${hospital.name}을(를) 즐겨찾기에서 삭제하시겠습니까?`);
                  if (!confirmed) {
                    return; // 취소하면 아무것도 하지 않음
                  }
                  toast.success(`${hospital.name} 즐겨찾기에서 제거되었습니다.`);
                  onToggleFavorite?.(hospital);
                } else {
                  // 병원찾기 페이지에서는 바로 추가/제거
                  if (isHospitalFavorite) {
                    toast.success(`${hospital.name} 즐겨찾기에서 제거되었습니다.`);
                  } else {
                    toast.success(`${hospital.name} 즐겨찾기에 추가되었습니다.`);
                  }
                  onToggleFavorite?.(hospital);
                }
              }}
            >
              <Heart size={24} className={isHospitalFavorite ? "fill-red-500" : ""} />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {hospital.specialtyText}
          </p>
        </div>
      </div>

      {/* 2. 하단 정보: 진료시간, 주소, 별점 */}
      {/* [수정] pt-4 와 border-t 제거 */}
      <div className="mt-4">
        {/* 진료 시간 */}
        <div className="flex items-center text-sm text-gray-700 mb-2">
          <span className="font-semibold text-[#1A73E8] mr-2">
            오늘 진료
          </span>
          <span>{hospital.hours}</span>
        </div>

        {/* 거리 + 주소 */}
        <p className="text-sm text-gray-500 mb-3 truncate">
          {hospital.distance} | {hospital.address}
        </p>

        {/* 태그 + 별점 */}
        <div className="flex items-center gap-2">
          {hospital.isAvailableNow && (
            <span className="bg-[#E7F3FF] text-[#2F80ED] text-xs font-semibold px-2 py-1 rounded-full">
              즉시 접수 가능
            </span>
          )}
          <div className="flex items-center gap-0.5 text-sm">
            <Star
              size={16}
              className="text-[#FFB800] fill-[#FFB800]"
            />
            <span className="text-[#1A1A1A] font-bold ml-1">
              {hospital.rating}
            </span>
            <span className="text-gray-400">
              ({hospital.reviews})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
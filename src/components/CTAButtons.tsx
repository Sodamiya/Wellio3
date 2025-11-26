// [수정] Calendar, Pill 아이콘은 더 이상 사용되지 않으므로 import에서 제거
// import { Calendar, Pill } from "lucide-react";

interface CTAButtonsProps {
  onHospitalClick: () => void;
}

export function CTAButtons({
  onHospitalClick,
}: CTAButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {/* Hospital Reception Button */}
      <button
        onClick={onHospitalClick}
        // [수정]
        // 1. 아이콘과 다중 텍스트 구조 제거
        // 2. flex-col -> flex items-center justify-center (텍스트 중앙 정렬)
        // 3. min-h-[120px], p-5 제거 -> h-15 (60px)로 높이 고정
        // 4. 배경/텍스트색 변경 (디자인 시안에 맞게)
        // 5. 폰트 굵기 추가
        // 6. 반응형 높이 추가
        className="border border-[#C9E3FF] bg-[#D7EAFF] text-[#555555] rounded-2xl flex items-center justify-center hover:bg-[#C9E3FF] transition-colors h-15 xs:h-20 font-medium xs:text-[19px] "
      >
        병원 접수하기
      </button>

      {/* Medicine Management Button */}
      <button
        // [수정]
        // 1. 아이콘과 다중 텍스트 구조 제거
        // 2. flex-col -> flex items-center justify-center (텍스트 중앙 정렬)
        // 3. min-h-[120px], p-5, border-2 제거 -> h-15 (60px)로 높이 고정
        // 4. 배경/텍스��색 변경 (디자인 시안에 맞게)
        // 5. 폰트 굵기 추가
        // 6. 반응형 높이 추가
        className="border border-[#e8e8e8] bg-[#f0f0f0] text-[#555555] rounded-2xl flex items-center justify-center hover:bg-[#e8e8e8] transition-colors h-15 xs:h-20 font-medium xs:text-[19px]"
      >
        복약관리
      </button>
    </div>
  );
}
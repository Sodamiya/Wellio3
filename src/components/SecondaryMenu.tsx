// lucide-react에서 임시 아이콘을 가져옵니다.
import { Headset, ClipboardList, UserCheck } from "lucide-react";

export function SecondaryMenu() {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      
      {/* 1. 웰코디 (그라데이션 테두리) */}
      {/* 그라데이션 테두리를 위해 겉에 div를 하나 감쌌습니다. */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-300 via-pink-300 to-cyan-300">
        <button className="w-full aspect-square flex flex-col items-center justify-center bg-white rounded-[15px] hover:bg-gray-50 transition-colors text-[16px]">
          {/* TODO: 이 아이콘을 실제 SVG/이미지로 교체하세요 */}
          <Headset size={32} className="text-cyan-500 md:w-10 md:h-10" />
          <span className="mt-2 text-sm font-medium text-gray-800">웰코디</span>
        </button>
      </div>

   
      {/* 3. 건강검진 */}
      <button className="w-full aspect-square flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
        {/* TODO: 이 아이콘을 실제 SVG/이미지로 교체하세요 */}
        <UserCheck size={32} className="text-gray-500 md:w-10 md:h-10" />
        <span className="mt-2 text-sm font-medium text-gray-800">건강검진</span>
      </button>
   {/* 2. 진료이력 */}
      <button className="w-full aspect-square flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
        {/* TODO: 이 아이콘을 실제 SVG/이미지로 교체하세요 */}
        <ClipboardList size={32} className="text-gray-500 md:w-10 md:h-10" />
        <span className="mt-2 text-sm font-medium text-gray-800">원클릭보험</span>
      </button>

    </div>
  );
}
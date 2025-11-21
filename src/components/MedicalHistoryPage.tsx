"use client";

import { ArrowLeft, Calendar, ChevronDown, Building2, Pill, Edit } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button"; // Button 컴포넌트를 사용하기 위해 추가

interface MedicalHistoryPageProps {
  onBack: () => void;
  onWriteReview?: (record: MedicalRecord) => void; // 리뷰 작성 페이지로 이동 (병원 정보 전달)
  reviewedHospitals?: number[]; // 리뷰 작성한 병원 ID 목록
  onViewReviews?: () => void; // 나의후기 페이지로 이동
  records?: MedicalRecord[]; // 진료내역 데이터
  onUpdateMemo?: (recordId: number, newMemo: string) => void; // 메모 업데이트 함수
}

interface MedicalRecord {
  id: number;
  code: string;
  patientName: string;
  patientAvatar: string;
  hospitalName: string;
  visitDate: string;
  visitTime: string;
  doctor: string;
  memo: string;
}

interface MedicalVisit {
  id: number;
  type: "hospital" | "pharmacy";
  name: string;
  visitDate: string;
  dayOfWeek: string;
}

// 진료내역 mock data (이전 수정분과 동일)
const mockRecords: MedicalRecord[] = [
  {
    id: 1,
    code: "20250811-012345",
    patientName: "김동석",
    patientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    hospitalName: "매일건강의원",
    visitDate: "2025.08.11",
    visitTime: "14:00",
    doctor: "이준호",
    memo: "아빠 감기몸살로 내원, 3일 뒤 재진"
  },
  {
    id: 2,
    code: "20250805-012345",
    patientName: "박승희",
    patientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    hospitalName: "바른정형외과의원",
    visitDate: "2025.08.05",
    visitTime: "10:25",
    doctor: "김슬기",
    memo: "엄마 2일마다 물리치료"
  },
  {
    id: 3,
    code: "REC-2024-003",
    patientName: "김웰리",
    patientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    hospitalName: "서울대학교병원",
    visitDate: "2024.11.05",
    visitTime: "16:00",
    doctor: "박민준 교수",
    memo: "정기 검진 완료, 특이사항 없음"
  },
];

// 의료내역 mock data (새로운 시안에 맞춰 업데이트)
const mockMedicalVisits: MedicalVisit[] = [
  {
    id: 1,
    type: "pharmacy",
    name: "하나약국",
    visitDate: "2025.07.14",
    dayOfWeek: "월",
  },
  {
    id: 2,
    type: "hospital",
    name: "고운피부과",
    visitDate: "2025.07.14",
    dayOfWeek: "월",
  },
  {
    id: 3,
    type: "pharmacy",
    name: "우리들약국",
    visitDate: "2025.07.05",
    dayOfWeek: "월",
  },
  {
    id: 4,
    type: "hospital",
    name: "희망찬정신건강의학과 의원",
    visitDate: "2025.07.05",
    dayOfWeek: "토",
  },
  {
    id: 5,
    type: "pharmacy",
    name: "서초드림약국",
    visitDate: "2025.07.05",
    dayOfWeek: "월",
  },
  // 기존 데이터는 삭제하거나 더 추가할 수 있습니다.
];

// 요일 매핑 함수 (이전 수정분과 동일)
const getDayOfWeek = (dateString: string) => {
  if (dateString.includes('08.11')) return '(월)';
  if (dateString.includes('08.05')) return '(화)';
  // 7월 예시 날짜 추가
  if (dateString.includes('07.14')) return '(월)';
  if (dateString.includes('07.05') && mockMedicalVisits.some(v => v.name.includes('약국') && v.visitDate === dateString)) return '(월)';
  if (dateString.includes('07.05') && mockMedicalVisits.some(v => v.name.includes('의원') && v.visitDate === dateString)) return '(토)';
  return '';
}

export function MedicalHistoryPage({ onBack, onWriteReview, reviewedHospitals = [], onViewReviews, records, onUpdateMemo }: MedicalHistoryPageProps) {
  const [activeTab, setActiveTab] = useState<"treatment" | "medical">("treatment");
  const [selectedFilter, setSelectedFilter] = useState<string>("period"); 

  const filters = [
    { id: "period", label: "기간검색" },
    { id: "kim-welly", label: "김웰리" },
    { id: "park-sw", label: "박승희" },
    { id: "kim-ds", label: "김동석" },
    { id: "kim-ds2", label: "김동석" }, 
  ];

  // records가 전달되지 않으면 mockRecords를 사용
  const displayRecords = records || mockRecords;

  return (
    <div className="relative bg-white flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between border-b border-gray-100 w-full bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-6 h-6 flex items-center justify-center"
          >
            <ArrowLeft size={24} className="text-[#1A1A1A]" />
          </button>
          <span className="text-lg font-bold text-[#1A1A1A]">
            진료내역
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("treatment")}
          className={`flex-1 py-4 text-center transition-colors ${
            activeTab === "treatment"
              ? "text-[#36D2C5] border-b-2 border-[#36D2C5]"
              : "text-gray-400"
          }`}
        >
          진료 내역
        </button>
        <button
          onClick={() => setActiveTab("medical")}
          className={`flex-1 py-4 text-center transition-colors ${
            activeTab === "medical"
              ? "text-[#36D2C5] border-b-2 border-[#36D2C5]"
              : "text-gray-400"
          }`}
        >
          의료 내역
        </button>
      </div>

      {/* Filter Tags */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
              selectedFilter === filter.id
                ? "bg-white text-gray-800 border-gray-400"
                : "bg-gray-100 text-gray-600 border-gray-100 hover:bg-gray-200"
            }`}
          >
            {filter.label}
            {filter.id === "period" && (
              <ChevronDown size={16} className="inline-block ml-1" />
            )}
            {filter.id === "kim-ds" && (
                 <ImageWithFallback
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                    alt="김동석"
                    className="w-5 h-5 rounded-full inline-block ml-1"
                />
            )}
             {filter.id === "kim-ds2" && (
                 <ImageWithFallback
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                    alt="김동석"
                    className="w-5 h-5 rounded-full inline-block ml-1"
                />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {/* 배경색을 흰색이 아닌 #F7F7F7로 변경 */}
      <div className="px-4 pb-20 bg-[#F7F7F7] flex-1">
        {activeTab === "treatment" ? (
          // 진료내역 (이전 수정 내용 유지)
          <div className="space-y-4 pt-4">
            {displayRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-gray-100"
              >
                {/* 1. 진료코드 + 프로필+이름 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {record.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <ImageWithFallback
                      src={record.patientAvatar}
                      alt={record.patientName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {record.patientName}
                    </span>
                  </div>
                </div>

                {/* 2. 병원이름 */}
                <div className="text-lg font-bold text-gray-900">
                  {record.hospitalName}
                </div>

                {/* 3. 내원일 */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>내원일</span>
                  <span className="text-gray-800 font-medium">
                    {record.visitDate}{getDayOfWeek(record.visitDate)} {record.visitTime}
                  </span>
                </div>

                {/* 4. 진료의 */}
                <div className="text-sm text-gray-600">
                  <span>진료의 </span>
                  <span className="text-gray-800 font-medium">{record.doctor}</span>
                </div>

                {/* 5. 한줄메모 */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2">
                    <Edit size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newMemo = e.currentTarget.textContent || '';
                        if (newMemo !== record.memo) {
                          onUpdateMemo?.(record.id, newMemo);
                        }
                      }}
                      className="flex-1 outline-none"
                    >
                      {record.memo}
                    </div>
                </div>

                {/* 6. 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (!reviewedHospitals.includes(record.id)) {
                        // 리뷰 작성하지 않은 병원만 리뷰 작성 페이지로 이동
                        onWriteReview?.(record);
                      } else {
                        // 리뷰 작성한 병원은 나의후기 페이지로 이동
                        onViewReviews?.();
                      }
                    }}
                    className="flex-1 py-3 h-14 text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {reviewedHospitals.includes(record.id) ? '작성한 리뷰' : '리뷰쓰기'} 
                  </Button>
                  <Button 
                    className="flex-1 py-3 h-14 text-sm font-semibold bg-[#36D2C5] text-white rounded-lg hover:bg-[#00C2B3] transition-colors"
                  >
                    재접수하기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 의료내역 - 새로운 시안 디자인 적용
          <div className="space-y-4 pt-4">
            {mockMedicalVisits.map((visit) => (
              <div
                key={visit.id}
                // 카드 스타일: 시안과 같이 배경 흰색, 둥근 모서리, 그림자/테두리 없음
                className="bg-white rounded-xl p-4 shadow-none space-y-2.5"
              >
                {/* 1. 병원/약국 이름 */}
                <div className="text-lg font-semibold text-gray-900">
                  {visit.name}
                </div>

                {/* 2. 내원일 (아이콘 제거, 텍스트 스타일 변경) */}
                <div className="text-sm text-gray-500">
                  <span>내원일</span>
                  {/* 시안 형식: 2025.07.14(월) */}
                  <span className="ml-2">
                    {visit.visitDate}{getDayOfWeek(visit.visitDate)}
                  </span>
                </div>
                
                {/* 3. 약국인 경우에만 버튼 표시 */}
                {visit.type === "pharmacy" && (
                  <Button 
                    variant="outline"
                    // 버튼 스타일: 시안과 같이 흰 배경, 민트색 테두리, 민트색 텍스트
                    className="w-full py-3 h-12 text-sm font-semibold border-2 border-[#36D2C5] text-[#36D2C5] bg-white hover:bg-gray-50 transition-colors mt-2"
                  >
                    내가 받은 약 보기
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
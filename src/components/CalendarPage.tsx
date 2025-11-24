import { ChevronLeft, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CalendarPageProps {
  onBack: () => void;
}

interface DayData {
  date: number;
  image?: string;
  tripStart?: boolean;
  tripEnd?: boolean;
  inTrip?: boolean;
  tripImage?: boolean;
  badge?: boolean;
  avatar?: string;
}

export function CalendarPage({ onBack }: CalendarPageProps) {
  const currentYear = 2025;
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  
  // 11월 섹션 참조
  const novemberRef = useRef<HTMLDivElement>(null);

  // 페이지 로드 시 11월로 스크롤
  useEffect(() => {
    if (novemberRef.current) {
      novemberRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  // 각 월별 데이터 정의
  const monthsData: { [key: number]: DayData[] } = {
    // 1월 (수요일 시작 - 빈 칸 3개)
    1: [
      { date: 0 }, { date: 0 }, { date: 0 }, // 빈 칸
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 },
      { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 },
      { date: 9 }, { date: 10 }, { date: 11 }, { date: 12 },
      { date: 13 }, { date: 14 }, { date: 15 }, { date: 16 },
      { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 },
      { date: 25 }, { date: 26 }, { date: 27 }, { date: 28 },
      { date: 29 }, { date: 30 }, { date: 31 },
    ],
    
    // 2월 (토요일 시작 - 빈 칸 6개)
    2: [
      { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 },
    ],
    
    // 3월 (토요일 시작 - 빈 칸 6개)
    3: [
      { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
      { date: 31 },
    ],
    
    // 4월 (화요일 시작 - 빈 칸 2개)
    4: [
      { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
    ],
    
    // 5월 (목요일 시작 - 빈 칸 4개)
    5: [
      { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 },
      { date: 4 }, { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 },
      { date: 9 }, { date: 10 }, { date: 11 }, { date: 12 }, { date: 13 },
      { date: 14 }, { date: 15 }, { date: 16 }, { date: 17 }, { date: 18 },
      { date: 19 }, { date: 20 }, { date: 21 }, { date: 22 }, { date: 23 },
      { date: 24 }, { date: 25 }, { date: 26 }, { date: 27 }, { date: 28 },
      { date: 29 }, { date: 30 }, { date: 31 },
    ],
    
    // 6월 (일요일 시작 - 빈 칸 0개)
    6: [
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
    ],
    
    // 7월 (화요일 시작 - 빈 칸 2개)
    7: [
      { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
      { date: 31 },
    ],
    
    // 8월 (금요일 시작 - 빈 칸 5개)
    8: [
      { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 },
      { date: 3 }, { date: 4 }, { date: 5 }, { date: 6 }, { date: 7 },
      { date: 8 }, { date: 9 }, { date: 10 }, { date: 11 }, { date: 12 },
      { date: 13 }, { date: 14 }, { date: 15 }, { date: 16 }, { date: 17 },
      { date: 18 }, { date: 19 }, { date: 20 }, { date: 21 }, { date: 22 },
      { date: 23 }, { date: 24 }, { date: 25 }, { date: 26 }, { date: 27 },
      { date: 28 }, { date: 29 }, { date: 30 }, { date: 31 },
    ],
    
    // 9월 (월요일 시작 - 빈 칸 1개)
    9: [
      { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
    ],
    
    // 10월 (수요일 시작 - 빈 칸 3개)
    10: [
      { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 },
      { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 },
      { date: 10 }, { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 },
      { date: 15 }, { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 },
      { date: 20 }, { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 },
      { date: 25 }, { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 },
      { date: 30 }, { date: 31 },
    ],
    
    // 11월 (토요일 시작 - 빈 칸 6개) - 원본 데이터 포함
    11: [
      { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 }, { date: 0 },
      { date: 1, image: "https://i.pravatar.cc/100?img=3" },
      { date: 2, image: "https://i.pravatar.cc/100?img=33" },
      { date: 3, image: "https://i.pravatar.cc/100?img=12" },
      { date: 4, image: "https://i.pravatar.cc/100?img=59" },
      { date: 5 },
      { date: 6 },
      { date: 7, image: "https://i.pravatar.cc/100?img=20" },
      { date: 8 },
      { date: 9 },
      { date: 10, image: "https://i.pravatar.cc/100?img=15" },
      { date: 11 },
      { date: 12 },
      { date: 13, image: "https://i.pravatar.cc/100?img=53" },
      { date: 14 },
      { date: 15 },
      { date: 16, tripStart: true },
      { date: 17, inTrip: true },
      { date: 18, inTrip: true },
      { date: 19, inTrip: true },
      { date: 20, inTrip: true },
      { date: 21, inTrip: true },
      { date: 22, tripEnd: true, inTrip: true },
      { date: 23, tripStart: true, inTrip: true },
      { date: 24, inTrip: true },
      { date: 25, tripEnd: true, inTrip: true },
      { date: 26 },
      { date: 27 },
      { date: 28 },
      { date: 29, image: "https://i.pravatar.cc/100?img=29", tripImage: true },
      { date: 30 },
    ],
    
    // 12월 (월요일 시작 - 빈 칸 1개)
    12: [
      { date: 0 },
      { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 },
      { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
      { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },
      { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
      { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 },
      { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
      { date: 31 },
    ],
  };

  const renderDay = (day: DayData, idx: number) => (
    <div
      key={idx}
      className="relative h-12 flex justify-center items-center"
    >
      {day.date === 0 ? null : day.image ? (
        // 이미지가 있는 날짜
        <div
          className={`w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center text-white shadow-md ${
            day.tripStart || day.tripImage ? "bg-[#2a8f8f]" : ""
          }`}
        >
          {day.tripStart ? (
            // 여행 시작일 (아이콘)
            <>
              <div className="absolute inset-0 bg-black opacity-10 z-0" />
              <svg
                className="relative z-10 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="absolute text-[10px] top-1.5 right-3 z-10">
                {day.date}
              </span>
            </>
          ) : (
            // 일반 이미지 날짜
            <>
              <ImageWithFallback
                src={day.image}
                alt=""
                className="absolute w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black opacity-30 z-0" />
              <span className="relative z-10 drop-shadow-md">
                {day.date}
              </span>
            </>
          )}
        </div>
      ) : day.tripStart || day.tripEnd || day.inTrip ? (
        // 여행 기간 표시
        <>
          <div
            className={`absolute top-0 bottom-0 left-0 right-0 bg-[#e0f8f8] z-0 ${
              day.tripStart && !day.tripEnd
                ? "rounded-l-full"
                : day.tripEnd && !day.tripStart
                  ? "rounded-r-full"
                  : ""
            }`}
          />
          <span className="relative z-10 text-gray-700">{day.date}</span>
        </>
      ) : (
        // 일반 날짜
        <span className="text-gray-700">{day.date}</span>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen overflow-y-auto">
      {/* 헤더 - sticky로 상단 고정 */}
      <div className="sticky top-0 z-10 bg-white flex justify-between items-center p-5 border-b border-gray-100">
        <button onClick={onBack} className="w-6 h-6">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="flex items-center gap-1">
          <span className="text-lg">캘린더</span>
          <ChevronDown size={16} className="text-gray-800" />
        </div>
        <div className="w-6" />
      </div>

      {/* 스크롤 가능한 월별 캘린더 영역 */}
      <div className="pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
          <div 
            key={month} 
            className="py-8 px-4 bg-white"
            ref={month === 11 ? novemberRef : null}
          >
            {/* 월 타이틀 */}
            <div className="text-center text-lg mb-5">
              {currentYear}년 {month}월
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 text-center mb-3 px-2">
              {weekDays.map((day, idx) => (
                <div key={idx} className="text-xs text-gray-500 mb-3">
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-4 text-center px-2">
              {monthsData[month].map((day, idx) => renderDay(day, idx))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
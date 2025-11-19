"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

export function CalendarCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = selectedDate;
  const selectedDay = selectedDate.getDate();

  const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

  const getDaysInSelectedWeek = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateObj = new Date(year, month, day);
    let dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) dayOfWeek = 6;
    else dayOfWeek -= 1;

    const monday = new Date(year, month, day - dayOfWeek);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayInWeek = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + i,
      );

      if (dayInWeek.getMonth() === month) {
        week.push(dayInWeek.getDate());
      } else {
        week.push(null);
      }
    }
    return week;
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const newSelectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    setSelectedDate(newSelectedDate);
  };

  const weekDays = getDaysInSelectedWeek(selectedDate);

  return (
    // [수정] rounded-t-2xl, overflow-hidden, shadow-md 추가
    // 반응형 패딩 추가
    <div className="w-full bg-white rounded-t-2xl overflow-hidden shadow-[0_2px_2.5px_0_#C9D0D833]">
      {/* 1. 달력 헤더 (년/월, 아이콘) */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 md:px-8 pt-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {formatMonth(currentMonth)}
        </h3>
        <CalendarDays size={20} className="text-gray-500" />
      </div>

      {/* 2. 요일 헤더 삭제됨 */}

      {/* 3. 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1 text-center px-4 sm:px-6 md:px-8">
        {weekDays.map((day, index) => {
          const isSelected = day === selectedDay;
          const dayOfWeekIndex = index; // 0:월, 1:화, ..., 6:일

          return (
            <div
              key={index}
              className="p-1 flex justify-center items-center h-20 md:h-24"
            >
              {day !== null && (
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full h-full rounded-lg flex flex-col justify-center items-center transition-all 
                    ${
                      isSelected
                        ? "bg-[#36D2C5]" // 선택된 날짜 배경
                        : "hover:bg-gray-50" // 선택 안된 날짜 호버
                    }`}
                >
                  {isSelected ? (
                    // --- 1. 선택된 날 (요일 + 흰색 원형 숫자) ---
                    <>
                      <span className="text-sm font-bold text-white">
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div className="mt-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-sm md:text-base font-medium bg-white text-gray-800">
                        {day}
                      </div>
                    </>
                  ) : (
                    // --- 2. 선택되지 않은 날 (요일 + 숫자) ---
                    <>
                      <span
                        className={`text-sm font-bold ${
                          dayOfWeekIndex === 6
                            ? "text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div
                        className={`mt-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-sm md:text-base font-medium ${
                          dayOfWeekIndex === 6
                            ? "text-red-400"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. 하단 알림 텍스트 */}
      <div className="mt-4 pt-4 border-t border-gray-100 px-4 sm:px-6 md:px-8 pb-4">
        <p className="text-sm text-gray-700">
          김웰리님 오늘{" "}
          <span className="text-blue-600 font-semibold">
            오후 9시
          </span>
          에 투여가 예정되어있습니다
        </p>
      </div>
    </div>
  );
}
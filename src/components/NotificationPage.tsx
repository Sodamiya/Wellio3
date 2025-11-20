"use client";

import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Notification {
  id: number;
  type: "hospital" | "family" | "medicine" | "challenge";
  category: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationPageProps {
  onBack: () => void;
  onDeleteNotification?: (id: number) => void;
}

export function NotificationPage({
  onBack,
  onDeleteNotification,
}: NotificationPageProps) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([
    {
      id: 1,
      type: "hospital",
      category: "병원 예약",
      message:
        "**김동석**님 매일건강의원 **14:00 진료** 접수되었습니다.\n초진이라면 신분증을 반드시 챙겨주세요.",
      time: "지금",
      isRead: false,
    },
    {
      id: 2,
      type: "family",
      category: "가족",
      message: "**박승희**님이 가족에 추가됐어요.",
      time: "5분전",
      isRead: false,
    },
    {
      id: 3,
      type: "family",
      category: "가족",
      message: "**김동석**님이 가족에 추가됐어요.",
      time: "5분전",
      isRead: false,
    },
    {
      id: 4,
      type: "medicine",
      category: "복약알림",
      message: "오늘 오후 9시 복용할 약이 있습니다.",
      time: "3시간전",
      isRead: true,
    },
    {
      id: 5,
      type: "challenge",
      category: "챌린지",
      message:
        "**김엘리**님 새로운 추천 챌린지가 있어요.\n눌러서 알아보세요.",
      time: "12시간전",
      isRead: true,
    },
    {
      id: 6,
      type: "medicine",
      category: "복약알림",
      message:
        "오늘 오후 6시, **박승희**님의 약 복용 시간입니다.",
      time: "1일전",
      isRead: true,
    },
  ]);

  // 드래그 삭제 관련 state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<number | null>(null);

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const handleDragEnd = (
    event: any,
    info: any,
    notificationId: number,
  ) => {
    // 왼쪽으로 100px 이상 드래그하면 삭제 확인 모달 표시
    if (info.offset.x < -100) {
      setNotificationToDelete(notificationId);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      if (onDeleteNotification) {
        onDeleteNotification(notificationToDelete);
      }
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationToDelete),
      );
    }
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "hospital":
        return {
          icon: "🏥",
          bgColor: "#e3f2fd",
          textColor: "#42a5f5",
        };
      case "family":
        return {
          icon: "❤️",
          bgColor: "#ffcdd2",
          textColor: "#ef5350",
        };
      case "medicine":
        return {
          icon: "💊",
          bgColor: "#ffe0b2",
          textColor: "#ff9800",
        };
      case "challenge":
        return {
          icon: "🏆",
          bgColor: "#fffde7",
          textColor: "#ffc107",
        };
      default:
        return {
          icon: "📢",
          bgColor: "#e0e0e0",
          textColor: "#757575",
        };
    }
  };

  const formatMessage = (message: string) => {
    // **텍스트** 를 bold로 변환
    const parts = message.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index}>
            {part.replace(/\*\*/g, "")}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] max-w-[500px] mx-auto">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Button clicked!");
            onBack();
          }}
          className="text-[#555] hover:text-[#333] transition-colors mr-5 relative z-50 cursor-pointer p-2 -m-2"
          style={{ pointerEvents: "auto" }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg -ml-10">
          알림
        </h1>
      </div>

      {/* 알림 리스트 */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => {
            const { icon, bgColor, textColor } =
              getIconAndColor(notification.type);
            return (
              <div key={notification.id} className="relative">
                {/* 휴지통 배경 */}
                <div className="absolute inset-0.5 flex items-center justify-end pr-6 bg-red-500 rounded-xl">
                  <Trash2 size={24} className="text-white" />
                </div>

                {/* 드래그 가능한 알림 카드 */}
                <motion.div
                  onClick={() =>
                    handleNotificationClick(notification.id)
                  }
                  className={`${
                    notification.isRead
                      ? "bg-white"
                      : "bg-[#E2F7F7]"
                  } rounded-xl p-4 shadow-sm flex items-start gap-4 cursor-pointer transition-colors hover:shadow-md relative`}
                  // [수정] 로드 시 애니메이션(initial, animate) 제거하여 빨간 배경 비침 방지
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(event, info) =>
                    handleDragEnd(event, info, notification.id)
                  }
                >
                  {/* 아이콘 */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span className="text-xl">{icon}</span>
                  </div>

                  {/* 텍스트 내용 */}
                  <div className="flex-1">
                    <div className="text-sm mb-1">
                      {notification.category}
                    </div>
                    <div className="text-sm leading-relaxed text-[#555] whitespace-pre-line">
                      {formatMessage(notification.message)}
                    </div>
                  </div>

                  {/* 시간 */}
                  <div
                    className={`text-xs flex-shrink-0 ${
                      notification.time === "지금"
                        ? "text-[#42a5f5]"
                        : "text-[#999]"
                    }`}
                  >
                    {notification.time}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelDelete}
            />

            {/* 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg mb-2">
                  알림을 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  삭제한 알림은 복구할 수 없습니다.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
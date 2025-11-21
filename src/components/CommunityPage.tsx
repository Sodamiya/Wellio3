"use client";

import {
  ArrowLeft,
  ChevronDown,
  Search,
  Bell,
  LayoutGrid,
  Calendar,
  Plus,
  MapPin,
  Cloud,
  Clock,
  Heart,
  X,
  Smile,
  Trash2,
} from "lucide-react";
import { useState, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import confetti from "canvas-confetti";
import "swiper/css";

interface CommunityPageProps {
  onBack: () => void;
  onUploadClick: () => void;
  onNotificationClick?: () => void;
  onDeletePost?: (postId: number) => void;
  posts: Array<{
    id: number;
    image: string;
    badge?: string;
    userAvatar: string;
    caption: string;
    userName: string;
    textOverlay?: string;
    location?: string;
    weather?: string;
    time?: string;
    health?: string;
    comments?: Array<{
      userName: string;
      userAvatar: string;
      text: string;
      timestamp: string;
    }>;
    reactions?: Array<{
      emoji: string;
      users: Array<{
        userName: string;
        userAvatar: string;
      }>;
    }>;
  }>;
  currentUserName: string;
  currentUserAvatar?: string;
}

// 가족 구성원 목데이터
const familyMembers = [
  { id: "all", name: "전체보기", avatar: "" },
  { id: "admin", name: "관리자", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
  { id: "guest", name: "게스트", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  { id: "mom", name: "엄마", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" },
  { id: "dad", name: "아빠", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
];

export function CommunityPage({
  onBack,
  onUploadClick,
  onNotificationClick,
  onDeletePost,
  posts,
  currentUserName,
  currentUserAvatar,
}: CommunityPageProps) {
  const [selectedGroup, setSelectedGroup] =
    useState("우리가족");
  const [selectedFamilyMember, setSelectedFamilyMember] = 
    useState<string | null>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isReactionView, setIsReactionView] = useState(false);
  
  // [추가] 리액션 필터 상태 (ALL 또는 이모지)
  const [reactionFilter, setReactionFilter] = useState("ALL");

  const [selectedPostForReaction, setSelectedPostForReaction] =
    useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<
    number | null
  >(null);
  const [emojiAnimation, setEmojiAnimation] = useState<{
    emoji: string;
    active: boolean;
  } | null>(null);

  // 검색 관련 state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 드래그 삭제 관련 state
  const [dragOffset, setDragOffset] = useState<{
    [postId: number]: number;
  }>({});
  const [dragStartX, setDragStartX] = useState<number | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<
    number | null
  >(null);

  // 스크롤 감지 state
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUser = {
    userName: currentUserName,
    userAvatar:
      currentUserAvatar ||
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  };

  const [addedComments, setAddedComments] = useState<{
    [postId: number]: Array<{
      userName: string;
      userAvatar: string;
      text: string;
      timestamp: string;
    }>;
  }>({});

  const [addedReactions, setAddedReactions] = useState<{
    [postId: number]: Array<{
      emoji: string;
      users: Array<{
        userName: string;
        userAvatar: string;
      }>;
    }>;
  }>({});

  const emojis = ["❤️", "👍", "😊", "🎉", "🔥", "👏"];

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;

    const now = new Date();
    const timeString = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newCommentObj = {
      userName: currentUser.userName,
      userAvatar: currentUser.userAvatar,
      text: newComment,
      timestamp: timeString,
    };

    setAddedComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj],
    }));

    setNewComment("");
  };

  const handleEmojiReaction = (
    emoji: string,
    postId: number,
  ) => {
    setEmojiAnimation({ emoji, active: true });

    setAddedReactions((prev) => {
      const existingReactions = prev[postId] || [];
      const existingReactionIndex = existingReactions.findIndex(
        (r) => r.emoji === emoji,
      );

      if (existingReactionIndex >= 0) {
        const updatedReactions = [...existingReactions];
        const userExists = updatedReactions[
          existingReactionIndex
        ].users.some(
          (u) => u.userName === currentUser.userName,
        );

        if (!userExists) {
          updatedReactions[existingReactionIndex] = {
            ...updatedReactions[existingReactionIndex],
            users: [
              ...updatedReactions[existingReactionIndex].users,
              currentUser,
            ],
          };
        }

        return {
          ...prev,
          [postId]: updatedReactions,
        };
      } else {
        return {
          ...prev,
          [postId]: [
            ...existingReactions,
            {
              emoji,
              users: [currentUser],
            },
          ],
        };
      }
    });

    setTimeout(() => {
      setEmojiAnimation(null);
    }, 2000);
  };

  const generateRandomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  const getAllComments = (
    postId: number,
    originalComments?: Array<any>,
  ) => {
    const original = originalComments || [];
    const added = addedComments[postId] || [];
    return [...original, ...added];
  };

  const getAllReactions = (
    postId: number,
    originalReactions?: Array<any>,
  ) => {
    const original = originalReactions || [];
    const added = addedReactions[postId] || [];

    const merged: { [emoji: string]: Array<any> } = {};

    [...original, ...added].forEach((reaction) => {
      if (merged[reaction.emoji]) {
        const existingUsers = merged[reaction.emoji];
        const newUsers = reaction.users.filter(
          (newUser: any) =>
            !existingUsers.some(
              (existingUser: any) =>
                existingUser.userName === newUser.userName,
            ),
        );
        merged[reaction.emoji] = [
          ...existingUsers,
          ...newUsers,
        ];
      } else {
        merged[reaction.emoji] = [...reaction.users];
      }
    });

    return Object.entries(merged).map(([emoji, users]) => ({
      emoji,
      users,
    }));
  };

  // [수정] 리액션 필터링 로직 적용
  const getFilteredReactionPosts = () => {
    // 1. 내가 반응(댓글 or 이모지)을 남긴 모든 포스트 가져오기
    const myReactedPosts = posts.filter((post) => {
      const hasMyComment = addedComments[post.id]?.some(
        (comment) => comment.userName === currentUser.userName,
      );
      const hasMyReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.users.some(
            (user) => user.userName === currentUser.userName,
          ),
      );
      return hasMyComment || hasMyReaction;
    });

    // 2. 필터가 'ALL'이면 전체 반환
    if (reactionFilter === "ALL") {
      return myReactedPosts;
    }

    // 3. 특정 이모지 필터링
    return myReactedPosts.filter((post) => {
      // 내가 해당 포스트에 남긴 리액션들 중, 현재 선택된 필터(이모지)가 있는지 확인
      const myReactionsInPost = addedReactions[post.id] || [];
      return myReactionsInPost.some(
        (reaction) => 
          reaction.emoji === reactionFilter && 
          reaction.users.some(u => u.userName === currentUser.userName)
      );
    });
  };

  const handleConfirmDelete = () => {
    if (postToDelete && onDeletePost) {
      onDeletePost(postToDelete);
    }
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const filteredPosts = posts.filter((post) => {
    // 가족 구성원 필터링
    if (selectedFamilyMember) {
      if (post.userName !== selectedFamilyMember) {
        return false;
      }
    }

    // 검색어 필터링
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const caption = post.caption?.toLowerCase() || "";
    const textOverlay = post.textOverlay?.toLowerCase() || "";
    const health = post.health?.toLowerCase() || "";
    const userName = post.userName?.toLowerCase() || "";

    return (
      caption.includes(query) ||
      textOverlay.includes(query) ||
      health.includes(query) ||
      userName.includes(query)
    );
  });

  return (
    <div className="relative bg-white flex flex-col max-w-[500px] mx-auto min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 flex flex-col justify-center border-b border-gray-100 w-full bg-white min-h-[110px]">
        {isSearchActive ? (
          <div className="flex items-center gap-3">
            <div
              className={`flex-1 bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2 transition-all border-2 ${
                isSearchFocused
                  ? "border-[#36D9D9]"
                  : "border-transparent"
              }`}
            >
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="게시글, 키워드를 검색해보세요"
                className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoFocus
              />
            </div>
            <button
              className="text-[#1A1A1A] text-sm font-medium"
              onClick={() => {
                setIsSearchActive(false);
                setSearchQuery("");
                setIsSearchFocused(false);
              }}
            >
              취소
            </button>
          </div>
        ) : isReactionView ? (
          // 리액션 뷰 헤더
          <div className="w-full flex items-center justify-center relative">
            <button
              onClick={() => setIsReactionView(false)}
              className="absolute left-0 w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
            <span className="text-lg font-bold text-[#1A1A1A]">
              리액션 모아보기
            </span>
          </div>
        ) : isGridView ? (
          <div className="w-full flex items-center justify-center relative">
            <button
              onClick={() => setIsGridView(false)}
              className="absolute left-0 w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>
            <button 
              className="flex items-center gap-1"
              onClick={() => setShowFamilyDropdown(!showFamilyDropdown)}
            >
              <span className="text-lg font-bold text-[#1A1A1A]">
                {selectedFamilyMember 
                  ? familyMembers.find(m => m.name === selectedFamilyMember)?.name || "모아보기"
                  : "모아보기"}
              </span>
              <ChevronDown
                size={20}
                className="text-gray-600"
              />
            </button>
            <button
              onClick={() => setIsReactionView(true)}
              className="absolute right-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart
                size={24}
                className="text-[#36D2C5]"
                fill="#36D2C5"
              />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center relative">
            <button
              onClick={onBack}
              className="absolute left-0 w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>
            <button 
              className="flex items-center gap-1"
              onClick={() => setShowFamilyDropdown(!showFamilyDropdown)}
            >
              <span className="text-lg font-bold text-[#1A1A1A]">
                {selectedFamilyMember 
                  ? familyMembers.find(m => m.name === selectedFamilyMember)?.name || "우리가족"
                  : "우리가족"}
              </span>
              <ChevronDown
                size={20}
                className="text-gray-600"
              />
            </button>

            <div className="absolute right-0 flex items-center gap-4">
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={() => {
                  setIsSearchActive(true);
                  setIsSearchFocused(true);
                }}
              >
                <Search size={20} className="text-[#1A1A1A]" />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={onNotificationClick}
              >
                <Bell size={20} className="text-[#1A1A1A]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 가족 구성원 드롭다운 */}
      <AnimatePresence>
        {showFamilyDropdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowFamilyDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-[120px] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      if (member.id === "all") {
                        setSelectedFamilyMember(null);
                      } else {
                        setSelectedFamilyMember(member.name);
                      }
                      setShowFamilyDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      (member.id === "all" && !selectedFamilyMember) ||
                      member.name === selectedFamilyMember
                        ? "bg-[#36D2C5]/10"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {member.avatar ? (
                      <ImageWithFallback
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#36D2C5] to-[#00C2B3] flex items-center justify-center">
                        <LayoutGrid size={20} className="text-white" />
                      </div>
                    )}
                    <span className="text-[#1A1A1A] font-medium">
                      {member.name}
                    </span>
                    {((member.id === "all" && !selectedFamilyMember) ||
                      member.name === selectedFamilyMember) && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#36D2C5] flex items-center justify-center">
                        <svg
                          width="12"
                          height="10"
                          viewBox="0 0 12 10"
                          fill="none"
                        >
                          <path
                            d="M1 5L4.5 8.5L11 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="w-full">
        {isReactionView ? (
          <div className="pb-20">
            {/* [추가] 리액션 필터 바 (가로 스크롤) */}
            <div className="px-4 py-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white sticky top-[110px] z-20">
              {/* ALL 버튼 */}
              <button
                onClick={() => setReactionFilter("ALL")}
                className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                  reactionFilter === "ALL"
                    ? "bg-[#F0F0F0] text-[#1A1A1A] border-[#36D2C5]" // 선택됨
                    : "bg-[#F0F0F0] text-[#999999] border-transparent" // 선택 안됨
                }`}
              >
                ALL
              </button>
              
              {/* 이모지 버튼들 */}
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setReactionFilter(emoji)}
                  className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl transition-all border-2 ${
                    reactionFilter === emoji
                      ? "bg-[#FFF8F8] border-[#36D2C5]" // 선택됨 (배경색 살짝 다르게)
                      : "bg-[#F0F0F0] border-transparent" // 선택 안됨
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="px-4">
              {getFilteredReactionPosts().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Heart
                    size={48}
                    className="text-gray-300 mb-4"
                  />
                  <p className="text-gray-500">
                    {reactionFilter === "ALL" 
                      ? "아직 리액션한 게시물이 없습니다" 
                      : `${reactionFilter} 반응을 남긴 게시물이 없습니다`}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    댓글이나 이모지를 남겨보세요!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {getFilteredReactionPosts().map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <ImageWithFallback
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                      {/* 필터링된 이모지가 있다면 우측 상단에 표시 */}
                      {reactionFilter !== "ALL" && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                          {reactionFilter}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : isGridView ? (
          <div className="px-4 py-4 pb-20">
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity group"
                >
                  <ImageWithFallback
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  {/* 호버 시 작성자 정보 표시 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <ImageWithFallback
                        src={post.userAvatar}
                        alt={post.userName}
                        className="w-6 h-6 rounded-full border border-white"
                      />
                      <span className="text-white text-xs font-medium">
                        {post.userName}
                      </span>
                    </div>
                  </div>
                  {/* 배지 표시 */}
                  {post.badge && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm">
                      {post.badge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Swiper
            direction={"vertical"}
            className="w-full h-[calc(100vh-190px)]"
            allowTouchMove={dragStartX === null}
            onSliderMove={() => {
              // 화면이 실제로 움직일 때만 스크롤 상태로 변경
              setIsScrolling(true);
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
            }}
            onSlideChangeTransitionStart={() => setIsScrolling(true)}
            onSlideChangeTransitionEnd={() => setIsScrolling(false)}
            onTouchEnd={() => {
              // 터치가 끝났을 때 스크롤 상태 해제 (약간의 지연 시간 둠)
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
              scrollTimerRef.current = setTimeout(() => {
                setIsScrolling(false);
              }, 150);
            }}
          >
            {filteredPosts.map((post) => {
              const isDeleting = postToDelete === post.id;
              return (
                <SwiperSlide key={post.id}>
                  <div className="h-full flex flex-col items-center px-4 py-4">
                    {/* Drag Delete Container */}
                    <div className="relative h-[85%] w-full overflow-visible">
                      {/* 휴지통 배경 */}
                      {post.userName === currentUser.userName && (
                        <div className="absolute inset-y-0 -right-2 w-32 flex items-center justify-center z-0">
                          <Trash2
                            size={32}
                            className="text-red-400"
                          />
                        </div>
                      )}

                      {/* Post Card */}
                      {post.userName === currentUser.userName ? (
                        <motion.div
                          className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg touch-none"
                          drag={!isScrolling ? "x" : false}
                          dragConstraints={{
                            left: -200,
                            right: 0,
                          }}
                          dragElastic={0.1} // 👈 약간의 탄성 추가 (자연스러운 느낌)
                          dragMomentum={false}
                          dragSnapToOrigin={!isDeleting} // 👈 삭제 대기 중이 아닐 때만 원점으로 복귀
                          animate={{
                            x: isDeleting ? -200 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                          whileDrag={{ 
                            scale: 0.98
                          }}
                          onDragStart={(event, info) => {
                            setDragStartX(info.point.x);
                          }}
                          onDrag={(event, info) => {
                            // 드래그 중 시각적 피드백을 위한 로그
                            console.log("Dragging:", info.offset.x);
                          }}
                          onDragEnd={(event, info) => {
                            console.log("Drag ended:", info.offset.x);
                            // 실제로 충분히 드래그했을 때만 삭제 모드로 전환
                            if (info.offset.x < -120) {
                              setPostToDelete(post.id);
                              setShowDeleteModal(true);
                            }
                            setDragStartX(null);
                          }}
                          onClick={(e) => {
                            // 드래그가 아닐 때만 클릭 이벤트 처리
                            if (!dragStartX) {
                              setSelectedPostForReaction(post.id);
                            }
                          }}
                        >
                          <ImageWithFallback
                            src={post.image}
                            alt="Community post"
                            className="w-full h-full object-cover bg-gray-100 pointer-events-none"
                          />

                          {/* 리액션 모드 오버레이 */}
                          {selectedPostForReaction ===
                            post.id && (
                            <div
                              className="absolute inset-0 bg-black/70 z-10 flex flex-col cursor-pointer"
                              // [수정] 오버레이 클릭 시 닫기 (이벤트 버블링 방지)
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPostForReaction(null);
                              }}
                            >
                              {/* 리액션 정보들... */}
                              {getAllReactions(
                                post.id,
                                post.reactions,
                              ).length > 0 && (
                                <div
                                  className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[60%] z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  {getAllReactions(
                                    post.id,
                                    post.reactions,
                                  ).flatMap((reaction) =>
                                    reaction.users.map(
                                      (user, userIdx) => (
                                        <div
                                          key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                          className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5 flex items-center gap-1.5"
                                        >
                                          <span className="text-base">
                                            {reaction.emoji}
                                          </span>
                                          <ImageWithFallback
                                            src={user.userAvatar}
                                            alt={user.userName}
                                            className="w-6 h-6 rounded-full border border-white"
                                          />
                                        </div>
                                      ),
                                    ),
                                  )}
                                </div>
                              )}

                              {post.textOverlay && (
                                <div
                                  className="absolute bottom-4 left-4 max-w-[70%] z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1 gap-2 shadow-sm">
                                    <ImageWithFallback
                                      src={post.userAvatar}
                                      alt={post.userName}
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                    <p className="text-sm text-gray-900 whitespace-nowrap">
                                      {post.textOverlay}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {getAllComments(
                                post.id,
                                post.comments,
                              ).length > 0 && (
                                <div
                                  className="absolute bottom-20 right-4 flex flex-col gap-2 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  {getAllComments(
                                    post.id,
                                    post.comments,
                                  ).map((comment, idx) => (
                                    <div
                                      key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                      className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1 gap-2 shadow-sm"
                                    >
                                      <p className="text-sm text-gray-900 whitespace-nowrap">
                                        {comment.text}
                                      </p>
                                      <ImageWithFallback
                                        src={comment.userAvatar}
                                        alt={comment.userName}
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 오버레이 정보들 (위치/날씨 등) */}
                          {selectedPostForReaction !== post.id &&
                            (post.location ||
                              post.weather ||
                              post.time ||
                              post.health) && (
                              <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {post.location && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <MapPin
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.location}
                                    </span>
                                  </div>
                                )}
                                {post.weather && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Cloud
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.weather}
                                    </span>
                                  </div>
                                )}
                                {post.time && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Clock
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.time}
                                    </span>
                                  </div>
                                )}
                                {post.health && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Heart
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.health}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          {selectedPostForReaction !== post.id &&
                            post.badge &&
                            !post.location &&
                            !post.weather &&
                            !post.time &&
                            !post.health && (
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium">
                                <span>{post.badge}</span>
                              </div>
                            )}

                          {selectedPostForReaction !==
                            post.id && (
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <ImageWithFallback
                                  src={post.userAvatar}
                                  alt={post.userName}
                                  className="w-8 h-8 rounded-full border-2 border-white"
                                />
                                {post.textOverlay && (
                                  <span className="text-white font-semibold text-sm line-clamp-1">
                                    {post.textOverlay}
                                  </span>
                                )}
                              </div>
                              <div className="bg-gray-100 rounded-full px-2.5 py-1 text-xs font-bold text-gray-800 flex items-center justify-center relative">
                                +
                                {
                                  getAllComments(
                                    post.id,
                                    post.comments,
                                  ).length
                                }
                                {getAllComments(
                                  post.id,
                                  post.comments,
                                ).length > 0 && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        // 남의 글
                        <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
                          <button
                            onClick={() =>
                              setSelectedPostForReaction(post.id)
                            }
                            className="w-full h-full"
                          >
                            <ImageWithFallback
                              src={post.image}
                              alt="Community post"
                              className="w-full h-full object-cover bg-gray-100"
                            />
                          </button>
                          {/* ... (남의 글 오버레이 동일) ... */}
                          {selectedPostForReaction ===
                            post.id && (
                            <div
                              className="absolute inset-0 bg-black/70 z-10 flex flex-col cursor-pointer"
                              onClick={() =>
                                setSelectedPostForReaction(null)
                              }
                            >
                              {/* ... 리액션 모드 오버레이 내용 동일 ... */}
                              {getAllReactions(
                                post.id,
                                post.reactions,
                              ).length > 0 && (
                                <div
                                  className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[60%] z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  {getAllReactions(
                                    post.id,
                                    post.reactions,
                                  ).flatMap((reaction) =>
                                    reaction.users.map(
                                      (user, userIdx) => (
                                        <div
                                          key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                          className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5 flex items-center gap-1.5"
                                        >
                                          <span className="text-base">
                                            {reaction.emoji}
                                          </span>
                                          <ImageWithFallback
                                            src={user.userAvatar}
                                            alt={user.userName}
                                            className="w-6 h-6 rounded-full border border-white"
                                          />
                                        </div>
                                      ),
                                    ),
                                  )}
                                </div>
                              )}

                              {post.textOverlay && (
                                <div
                                  className="absolute bottom-4 left-4 max-w-[70%] z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1 gap-2 shadow-sm">
                                    <ImageWithFallback
                                      src={post.userAvatar}
                                      alt={post.userName}
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                    <p className="text-sm text-gray-900 whitespace-nowrap">
                                      {post.textOverlay}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {getAllComments(
                                post.id,
                                post.comments,
                              ).length > 0 && (
                                <div
                                  className="absolute bottom-20 right-4 flex flex-col gap-2 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  {getAllComments(
                                    post.id,
                                    post.comments,
                                  ).map((comment, idx) => (
                                    <div
                                      key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                      className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1 gap-2 shadow-sm"
                                    >
                                      <p className="text-sm text-gray-900 whitespace-nowrap">
                                        {comment.text}
                                      </p>
                                      <ImageWithFallback
                                        src={comment.userAvatar}
                                        alt={comment.userName}
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {selectedPostForReaction !== post.id &&
                            (post.location ||
                              post.weather ||
                              post.time ||
                              post.health) && (
                              <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {post.location && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <MapPin
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.location}
                                    </span>
                                  </div>
                                )}
                                {post.weather && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Cloud
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.weather}
                                    </span>
                                  </div>
                                )}
                                {post.time && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Clock
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.time}
                                    </span>
                                  </div>
                                )}
                                {post.health && (
                                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <Heart
                                      size={16}
                                      className="text-white"
                                    />
                                    <span className="text-white text-sm">
                                      {post.health}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          {selectedPostForReaction !== post.id &&
                            post.badge &&
                            !post.location &&
                            !post.weather &&
                            !post.time &&
                            !post.health && (
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium">
                                <span>{post.badge}</span>
                              </div>
                            )}

                          {selectedPostForReaction !==
                            post.id && (
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <ImageWithFallback
                                  src={post.userAvatar}
                                  alt={post.userName}
                                  className="w-8 h-8 rounded-full border-2 border-white"
                                />
                                {post.textOverlay && (
                                  <span className="text-white font-semibold text-sm line-clamp-1">
                                    {post.textOverlay}
                                  </span>
                                )}
                              </div>
                              <div className="bg-gray-100 rounded-full px-2.5 py-1 text-xs font-bold text-gray-800 flex items-center justify-center relative">
                                +
                                {
                                  getAllComments(
                                    post.id,
                                    post.comments,
                                  ).length
                                }
                                {getAllComments(
                                  post.id,
                                  post.comments,
                                ).length > 0 && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 댓글 및 이모지 입력 영역 */}
                    <div className="relative flex items-center gap-2 w-full mt-4 h-[56px]">
                      <AnimatePresence>
                        {emojiAnimation &&
                          emojiAnimation.active &&
                          currentPostId === post.id && (
                            <div className="fixed inset-0 pointer-events-none z-50">
                              {emojiAnimation.emoji === "❤️" ? (
                                <>
                                  {Array.from({ length: 30 }).map(
                                    (_, i) => {
                                      const pos =
                                        generateRandomPosition();
                                      return (
                                        <motion.div
                                          key={`heart-${post.id}-${i}`}
                                          initial={{
                                            opacity: 0,
                                            scale: 0,
                                            x: `${pos.x}vw`,
                                            y: `${pos.y}vh`,
                                          }}
                                          animate={{
                                            opacity: [0, 1, 1, 0],
                                            scale: [
                                              0, 1.5, 1.5, 0,
                                            ],
                                          }}
                                          exit={{
                                            opacity: 0,
                                            scale: 0,
                                          }}
                                          transition={{
                                            duration: 1.5,
                                            delay:
                                              Math.random() * 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="absolute text-6xl"
                                        >
                                          ❤️
                                        </motion.div>
                                      );
                                    },
                                  )}
                                </>
                              ) : emojiAnimation.emoji ===
                                "👍" ? (
                                <>
                                  {Array.from({ length: 20 }).map(
                                    (_, i) => {
                                      const angle =
                                        (i / 20) * Math.PI * 2;
                                      const distance =
                                        200 + Math.random() * 200;
                                      return (
                                        <motion.div
                                          key={`thumbs-${post.id}-${i}`}
                                          initial={{
                                            opacity: 0,
                                            scale: 0,
                                            x: "50vw",
                                            y: "50vh",
                                          }}
                                          animate={{
                                            opacity: [0, 1, 1, 0],
                                            scale: [0, 1.5, 1, 0],
                                            x: `calc(50vw + ${
                                              Math.cos(angle) *
                                              distance
                                            }px)`,
                                            y: `calc(50vh + ${
                                              Math.sin(angle) *
                                              distance
                                            }px)`,
                                            rotate: [0, 360],
                                          }}
                                          exit={{
                                            opacity: 0,
                                            scale: 0,
                                          }}
                                          transition={{
                                            duration: 1.5,
                                            delay: i * 0.05,
                                            ease: "easeOut",
                                          }}
                                          className="absolute text-5xl"
                                        >
                                          👍
                                        </motion.div>
                                      );
                                    },
                                  )}
                                </>
                              ) : null}
                            </div>
                          )}
                      </AnimatePresence>

                      {/* 이모지 토글 버튼 */}
                      <button
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors overflow-hidden relative"
                        onClick={() => {
                          setCurrentPostId(post.id);
                          setShowEmojiPicker(!showEmojiPicker);
                        }}
                      >
                        <AnimatePresence
                          mode="wait"
                          initial={false}
                        >
                          {showEmojiPicker &&
                          currentPostId === post.id ? (
                            <motion.div
                              key="close-icon"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5] text-gray-800 rounded-full"
                            >
                              <X size={20} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="smile-icon"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 flex items-center justify-center text-gray-500 hover:text-gray-800"
                            >
                              <Smile size={24} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* 입력창과 이모지 리스트 컨테이너 */}
                      <div className="flex-1 h-full relative flex items-center">
                        <AnimatePresence
                          mode="wait"
                          initial={false}
                        >
                          {showEmojiPicker &&
                          currentPostId === post.id ? (
                            // 이모지 리스트 (배경 제거, 각 버튼에 배경 적용)
                            <motion.div
                              key="emoji-list"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 flex items-center gap-2 overflow-x-auto no-scrollbar" // px-2 제거, 배경 제거
                            >
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    setCurrentPostId(post.id);
                                    handleEmojiReaction(
                                      emoji,
                                      post.id,
                                    );
                                    confetti({
                                      particleCount: 100,
                                      spread: 70,
                                      origin: { y: 0.6 },
                                    });
                                  }}
                                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-2xl bg-[#F5F5F5] rounded-full transition-colors" // 배경색 추가
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          ) : (
                            // 댓글 입력창
                            <motion.div
                              key="comment-input"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-y-2 inset-x-0 flex items-center bg-[#F5F5F5] rounded-full px-4"
                            >
                              <input
                                type="text"
                                placeholder="댓글을 작성해주세요"
                                className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-gray-400"
                                value={newComment}
                                onChange={(e) =>
                                  setNewComment(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !e.shiftKey
                                  ) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      {!isGridView && !isReactionView && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white border-t border-gray-100 z-20">
          <div className="relative px-4 pt-2 pb-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setIsGridView(true)}
                className="flex flex-col items-center gap-1 text-gray-800"
              >
                <LayoutGrid size={24} />
                <span className="text-xs font-semibold">
                  모아보기
                </span>
              </button>
              <div className="w-16" />
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <Calendar size={24} />
                <span className="text-xs">캘린더</span>
              </button>
            </div>
            <button
              className="absolute left-1/2 -translate-x-1/2 -top-[34px] w-14 h-14 bg-[#36D2C5] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00C2B3] transition-colors"
              onClick={onUploadClick}
            >
              <Plus size={28} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelDelete}
            />

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
                  글을 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  삭제한 글은 복구할 수 없습니다.
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
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
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import "swiper/css";
import { BottomNav } from "./BottomNav";

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
  currentPage?: string;
  onPageChange?: (page: any) => void;
}

// 가족 구성원 목데이터
const familyMembers = [
  { id: "all", name: "전체보기", avatar: "" },
  {
    id: "admin",
    name: "관리자",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    id: "guest",
    name: "게스트",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: "mom",
    name: "엄마",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
  },
  {
    id: "dad",
    name: "아빠",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
];

export function CommunityPage({
  onBack,
  onUploadClick,
  onNotificationClick,
  onDeletePost,
  posts,
  currentUserName,
  currentUserAvatar,
  currentPage,
  onPageChange,
}: CommunityPageProps) {
  const [selectedGroup, setSelectedGroup] =
    useState("우리가족");
  const [selectedFamilyMember, setSelectedFamilyMember] =
    useState<string | null>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] =
    useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isReactionView, setIsReactionView] = useState(false);

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

  // 이미지 확대 보기(라이트박스) 상태
  const [expandedPostId, setExpandedPostId] = useState<
    number | null
  >(null);
  // [추가] 애니메이션이 끝날 때까지 z-index를 유지하기 위한 상태
  const [lastExpandedId, setLastExpandedId] = useState<
    number | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [dragStartX, setDragStartX] = useState<number | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<
    number | null
  >(null);

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

  const getFilteredReactionPosts = () => {
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

    if (reactionFilter === "ALL") {
      return myReactedPosts;
    }

    return myReactedPosts.filter((post) => {
      const myReactionsInPost = addedReactions[post.id] || [];
      return myReactionsInPost.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          ),
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

  // [추가] 라이트박스 닫기 핸들러
  const handleCloseLightbox = () => {
    setLastExpandedId(expandedPostId); // 닫히는 포스트 ID 저장
    setExpandedPostId(null);
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedFamilyMember) {
      if (post.userName !== selectedFamilyMember) {
        return false;
      }
    }

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

  const expandedPost = posts.find(
    (p) => p.id === expandedPostId,
  );

  return (
    <div className="relative bg-white flex flex-col max-w-[500px] mx-auto min-h-screen pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 flex flex-col justify-center w-full bg-white min-h-[110px]">
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
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
            <button
              className="flex items-center gap-1"
              onClick={() =>
                setShowFamilyDropdown(!showFamilyDropdown)
              }
            >
              <span className="text-lg font-bold text-[#1A1A1A]">
                {selectedFamilyMember
                  ? familyMembers.find(
                      (m) => m.name === selectedFamilyMember,
                    )?.name || "모아보기"
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
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
            <button
              className="flex items-center gap-1"
              onClick={() =>
                setShowFamilyDropdown(!showFamilyDropdown)
              }
            >
              <span className="text-lg font-bold text-[#1A1A1A]">
                {selectedFamilyMember
                  ? familyMembers.find(
                      (m) => m.name === selectedFamilyMember,
                    )?.name || "우리가족"
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
                      (member.id === "all" &&
                        !selectedFamilyMember) ||
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
                        <LayoutGrid
                          size={20}
                          className="text-white"
                        />
                      </div>
                    )}
                    <span className="text-[#1A1A1A] font-medium">
                      {member.name}
                    </span>
                    {((member.id === "all" &&
                      !selectedFamilyMember) ||
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
            {/* 리액션 필터 바 (가로 스크롤) */}
            <div className="px-4 py-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white sticky top-[110px] z-20">
              {/* ALL 버튼 */}
              <button
                onClick={() => setReactionFilter("ALL")}
                className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                  reactionFilter === "ALL"
                    ? "bg-[#F0F0F0] text-[#1A1A1A] border-[#36D2C5]"
                    : "bg-[#F0F0F0] text-[#999999] border-transparent"
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
                      ? "bg-[#FFF8F8] border-[#36D2C5]"
                      : "bg-[#F0F0F0] border-transparent"
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
                    <motion.div
                      key={post.id}
                      layoutId={`post-${post.id}`}
                      className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                      // [추가] z-index 유지 (확대 또는 축소 중일 때)
                      style={{
                        zIndex:
                          expandedPostId === post.id ||
                          lastExpandedId === post.id
                            ? 50
                            : 0,
                      }}
                      onLayoutAnimationComplete={() => {
                        // 애니메이션 완료 시 lastExpandedId 초기화
                        if (lastExpandedId === post.id) {
                          setLastExpandedId(null);
                        }
                      }}
                      onClick={() => setExpandedPostId(post.id)}
                    >
                      <ImageWithFallback
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                      {reactionFilter !== "ALL" && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                          {reactionFilter}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : isGridView ? (
          <div className="px-4 py-4 pb-20">
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layoutId={`post-${post.id}`}
                  className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity group"
                  // [추가] z-index 유지 (확대 또는 축소 중일 때)
                  style={{
                    zIndex:
                      expandedPostId === post.id ||
                      lastExpandedId === post.id
                        ? 50
                        : 0,
                  }}
                  onLayoutAnimationComplete={() => {
                    // 애니메이션 완료 시 lastExpandedId 초기화
                    if (lastExpandedId === post.id) {
                      setLastExpandedId(null);
                    }
                  }}
                  onClick={() => setExpandedPostId(post.id)}
                >
                  <ImageWithFallback
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <ImageWithFallback
                        src={post.userAvatar}
                        alt={post.userName}
                        className="w-6 h-6 rounded-full border border-white object-cover"
                      />
                      <span className="text-white text-xs font-medium">
                        {post.userName}
                      </span>
                    </div>
                  </div>
                  {post.badge && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm">
                      {post.badge}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <Swiper
            direction={"vertical"}
            className="w-full h-[calc(100vh-246px)]"
            allowTouchMove={dragStartX === null}
            onSliderMove={() => {
              setIsScrolling(true);
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
            }}
            onSlideChangeTransitionStart={() =>
              setIsScrolling(true)
            }
            onSlideChangeTransitionEnd={() =>
              setIsScrolling(false)
            }
            onTouchEnd={() => {
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
                  <div className="h-full flex flex-col items-center justify-center px-4">
                    <div className="relative h-[85%] max-h-[600px] w-full max-w-[400px] overflow-visible">
                      {post.userName ===
                        currentUser.userName && (
                        <div className="absolute inset-y-0 -right-2 w-32 flex items-center justify-center z-0">
                          <Trash2
                            size={32}
                            className="text-gray-400"
                          />
                        </div>
                      )}
                      <motion.div
                        className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg touch-none"
                        drag={!isScrolling ? "x" : false}
                        dragConstraints={{
                          left: -200,
                          right: 0,
                        }}
                        dragElastic={0.1}
                        dragMomentum={false}
                        dragSnapToOrigin={!isDeleting}
                        animate={{ x: isDeleting ? -200 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        whileDrag={{ scale: 0.98 }}
                        onDragStart={(event, info) =>
                          setDragStartX(info.point.x)
                        }
                        onDragEnd={(event, info) => {
                          if (info.offset.x < -120) {
                            setPostToDelete(post.id);
                            setShowDeleteModal(true);
                          }
                          setDragStartX(null);
                        }}
                        onClick={(e) => {
                          if (!dragStartX)
                            setSelectedPostForReaction(post.id);
                        }}
                      >
                        {/* ... (기존 코드와 동일) ... */}
                        <ImageWithFallback
                          src={post.image}
                          alt="Community post"
                          className="w-full h-full object-cover bg-gray-100 pointer-events-none"
                        />
                        {/* ... (기존 코드와 동일) ... */}
                        {selectedPostForReaction ===
                          post.id && (
                          <div
                            className="absolute inset-0 bg-black/70 z-10 flex flex-col cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPostForReaction(null);
                            }}
                          >
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
                            {/* [수정: Pressed 상태의 캡슐 위치 및 스타일 통일] */}
                            {(post.textOverlay ||
                              post.userName) && (
                              <div
                                className="absolute bottom-4 left-4 flex items-center gap-3 z-20 max-w-[90%]"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                {/* 1. 프로필 + 텍스트 캡슐 */}
                                <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-5 py-3 gap-3 shadow-sm border border-white/20 shrink-0">
                                  <ImageWithFallback
                                    src={post.userAvatar}
                                    alt={post.userName}
                                    // 이미지: w-12 h-12 (48px), -my-4, -ml-2
                                    className="w-12 h-12 rounded-full object-cover border-3 border-white -my-4 -ml-2 shadow-sm"
                                  />
                                  <p className="text-[15px] text-gray-900 whitespace-nowrap font-bold leading-none">
                                    {post.textOverlay ||
                                      post.userName}
                                  </p>
                                </div>
                              </div>
                            )}
                            {getAllComments(
                              post.id,
                              post.comments,
                            ).length > 0 && (
                              <div
                                // [수정] right-4 -> right-0 변경. p-4가 있으므로 시각적으로는 16px 떨어짐.
                                className="absolute bottom-20 right-0 flex flex-col gap-5 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20 p-4 scrollbar-hide"
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
                                    // [수정] 댓글 캡슐: 우측 정렬이므로 flex-row-reverse 및 padding 반전 (pl-5 pr-1)
                                    className="inline-flex flex-row-reverse items-center bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1 py-3 gap-3 shadow-sm border border-white/20"
                                  >
                                    <ImageWithFallback
                                      src={comment.userAvatar}
                                      alt={comment.userName}
                                      // [수정] 이미지: w-11 h-11, -my-4, -mr-2(오른쪽돌출)
                                      className="w-9 h-9 rounded-full object-cover border-2 border-white -my-4 -mr-0.5 shadow-sm"
                                    />
                                    <p className="text-[15px] text-gray-900 whitespace-nowrap font-medium leading-none">
                                      {comment.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {/* ... (기존 코드와 동일) ... */}
                        {selectedPostForReaction !==
                          post.id && (
                          <>
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
                            {post.badge &&
                              !post.location &&
                              !post.weather &&
                              !post.time &&
                              !post.health && (
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium">
                                  <span>{post.badge}</span>
                                </div>
                              )}

                            {/* === [수정된 부분: 하단 프로필 캡슐 및 댓글 카운트 (Outside State)] === */}
                            {/* Pressed State와 완전히 동일한 크기/패딩/위치를 사용하여 
                                전환 시 '점프' 현상을 방지함.
                            */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10 max-w-[90%]">
                              {/* 1. 프로필 + 텍스트 캡슐 */}
                              {/* pl-1 pr-5 py-3 gap-3 사용 (Pressed State와 동일) */}
                              <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-5 py-3 gap-3 shadow-sm border border-white/20 shrink-0">
                                <ImageWithFallback
                                  src={
                                    post.userName ===
                                    currentUserName
                                      ? currentUserAvatar
                                      : post.userAvatar
                                  }
                                  alt={post.userName}
                                  // 이미지: w-12 h-12, -my-4, -ml-2 (Pressed State와 동일)
                                  className="w-12 h-12 rounded-full object-cover border-3 border-white -my-4 -ml-2 shadow-sm"
                                />
                                {/* 폰트: text-[15px] font-bold (Pressed State와 동일) */}
                                <span className="text-[15px] text-gray-900 font-bold leading-none">
                                  {post.textOverlay ||
                                    post.userName}
                                </span>
                              </div>

                              {/* 2. 댓글 카운트 말풍선 */}
                              <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-2 font-bold flex items-center justify-center shadow-sm border border-white/20 shrink-0 relative text-[16px]">
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
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            {/* ================================================= */}
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      {/* 이모지/댓글 입력창 (하단 고정) */}
      <div className="fixed bottom-[100px] left-0 right-0 z-40 max-w-[500px] mx-auto px-4 bg-transparent pointer-events-none">
        <div className="relative flex items-center gap-2 w-full h-[56px] pointer-events-auto">
          <button
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors overflow-hidden relative"
            onClick={() => {
              setCurrentPostId(currentPostId);
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showEmojiPicker ? (
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
          <div className="flex-1 h-full relative flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              {showEmojiPicker ? (
                <motion.div
                  key="emoji-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center gap-2 overflow-x-auto no-scrollbar"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        if (currentPostId) {
                          handleEmojiReaction(emoji, currentPostId);
                          confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                          });
                        }
                      }}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-2xl bg-[#F5F5F5] rounded-full transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              ) : (
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
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (currentPostId) {
                          handleAddComment(currentPostId);
                        }
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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

      {/* 이미지 확대 보기 모달 (Lightbox) */}
      <AnimatePresence>
        {expandedPostId && expandedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            // [수정] 닫기 핸들러 사용
            onClick={handleCloseLightbox}
          >
            <motion.div
              layoutId={`post-${expandedPostId}`}
              className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={expandedPost.image}
                alt={expandedPost.caption}
                className="w-full h-full object-cover"
              />
              {/* 닫기 버튼 제거됨 */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 커뮤니티 전용 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto bg-white">
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
    </div>
  );
}
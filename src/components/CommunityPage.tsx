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
  currentUserAvatar?: string; // 👈 현재 사용자 프로필 이미지 추가
}

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
  const [isGridView, setIsGridView] = useState(false);
  const [isReactionView, setIsReactionView] = useState(false);
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

  // 디버깅: 현재 사용자 정보 확인
  console.log("Current User:", currentUser.userName);
  console.log(
    "Posts:",
    posts.map((p) => ({ id: p.id, userName: p.userName })),
  );

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
    // 이모지 선택 후 닫고 싶다면 아래 주석 해제
    // setShowEmojiPicker(false);

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

  const getMyReactionPosts = () => {
    return posts.filter((post) => {
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

  // 게시글 필터링 로직
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true; // 검색어가 없으면 모두 표시

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
          // 검색 모드
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
          // 리액션 뷰
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReactionView(false)}
              className="w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
            <span className="text-lg font-bold text-[#1A1A1A]">
              리액션 모아보기
            </span>
          </div>
        ) : isGridView ? (
          // 그리드 뷰
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsGridView(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <ArrowLeft
                  size={24}
                  className="text-[#1A1A1A]"
                />
              </button>
              <span className="text-lg font-bold text-[#1A1A1A]">
                모아보기
              </span>
            </div>
            <button
              onClick={() => setIsReactionView(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart
                size={24}
                className="text-[#36D2C5]"
                fill="#36D2C5"
              />
            </button>
          </div>
        ) : (
          // 기본 뷰
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-6 h-6 flex items-center justify-center"
              >
                <ArrowLeft
                  size={24}
                  className="text-[#1A1A1A]"
                />
              </button>
              <button className="flex items-center gap-1">
                <span className="text-lg font-bold text-[#1A1A1A]">
                  {selectedGroup}
                </span>
                <ChevronDown
                  size={20}
                  className="text-gray-600"
                />
              </button>
            </div>

            <div className="flex items-center gap-4">
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

      {/* Content Area (Swiper) */}
      <div className="w-full">
        {isReactionView ? (
          <div className="px-4 py-4 pb-20">
            {getMyReactionPosts().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart
                  size={48}
                  className="text-gray-300 mb-4"
                />
                <p className="text-gray-500">
                  아직 리액션한 게시물이 없습니다
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  댓글이나 이모지를 남겨보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {getMyReactionPosts().map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <ImageWithFallback
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                      <Heart
                        size={12}
                        className="text-[#36D2C5]"
                        fill="#36D2C5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isGridView ? (
          <div className="px-4 py-4 pb-20">
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <ImageWithFallback
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Swiper
            direction={"vertical"}
            className="w-full h-[calc(100vh-190px)]"
            allowTouchMove={dragStartX === null}
            onTouchStart={() => {
              // 스크롤 시작
              setIsScrolling(true);
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
            }}
            onTouchEnd={() => {
              // 스크롤 종료 후 150ms 뒤에 좌우 드래그 활성화
              if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
              }
              scrollTimerRef.current = setTimeout(() => {
                setIsScrolling(false);
              }, 150);
            }}
          >
            {filteredPosts.map((post) => (
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
                        dragElastic={0}
                        dragMomentum={false}
                        whileDrag={{ 
                          scale: 0.98,
                          boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
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
                          // 실제로 충분히 드래그했을 때만 삭제
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
                            onClick={() =>
                              setSelectedPostForReaction(null)
                            }
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
                                src={post.userName === currentUserName ? currentUserAvatar : post.userAvatar}
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
            ))}
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
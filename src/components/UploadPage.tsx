"use client";

import {
  Image as ImageIcon,
  Camera,
  RefreshCw,
  ArrowLeft,
  Upload,
  Edit,
  Sparkles,
  X,
  Type,
  MapPin,
  Cloud,
  Clock,
  Heart,
  Check,
  Footprints, // 추가
  Flame, // 추가
  TrendingUp, // 추가 (오른층수용)
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "framer-motion";

// 원본 필터 목록
const ORIGINAL_FILTERS = [
  { name: "Normal", filter: "none" },
  {
    name: "Kilda",
    filter:
      "brightness(1.0) contrast(1.2) saturate(1.25) hue-rotate(-5deg)",
  },
  {
    name: "Still",
    filter:
      "brightness(1.0) contrast(1.0) saturate(0.5) grayscale(0.3)",
  },
  {
    name: "Fade",
    filter:
      "brightness(1.1) contrast(0.85) saturate(0.9) sepia(0.05)",
  },
  {
    name: "Paris",
    filter:
      "brightness(1.15) contrast(0.95) saturate(1.0) sepia(0.08) blur(0.3px)",
  },
  {
    name: "Lapis",
    filter:
      "brightness(1.0) contrast(1.08) saturate(1.1) hue-rotate(10deg)",
  },
  {
    name: "Simple",
    filter: "brightness(1.08) contrast(1.0) saturate(1.0)",
  },
];

interface UploadPageProps {
  onBack: () => void;
  onUpload: (post: {
    image: string;
    caption: string;
    textOverlay?: string;
    location?: string;
    weather?: string;
    time?: string;
    health?: string;
  }) => void;
}

export function UploadPage({
  onBack,
  onUpload,
}: UploadPageProps) {
  const [showCameraPermission, setShowCameraPermission] =
    useState(false);
  const [showGalleryPermission, setShowGalleryPermission] =
    useState(false);
  const [permissionsGranted, setPermissionsGranted] =
    useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(
    null,
  );
  const [cameraError, setCameraError] = useState<string | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<
    string | null
  >(null);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [hasCameraDevice, setHasCameraDevice] = useState<
    boolean | null
  >(null);
  const [isDetailEditMode, setIsDetailEditMode] =
    useState(false);

  // 세부 입력 state
  const [textInput, setTextInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [weatherInput, setWeatherInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [healthInput, setHealthInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showNoImageAlert, setShowNoImageAlert] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  // 필터 모드 state
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState("Normal");
  const [previousFilter, setPreviousFilter] = useState("Normal"); // 필터 취소를 위한 이전 필터 저장

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [수정] 무한 루프를 안정적으로 돌리기 위해 데이터를 3배로 불림
  const loopFilters = useMemo(() => {
    return [
      ...ORIGINAL_FILTERS,
      ...ORIGINAL_FILTERS,
      ...ORIGINAL_FILTERS,
    ];
  }, []);

  // 매번 권한 팝업 표시 (카메라 먼저)
  useEffect(() => {
    // 권한 팝업 없이 바로 시작 (카메라는 선택적)
    setPermissionsGranted(true);
  }, []);

  // 카메라 스트림 시작
  useEffect(() => {
    if (!permissionsGranted) return;

    const startCamera = async () => {
      try {
        // 기존 스트림 정리
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        // 먼저 사용 가능한 카메라가 있는지 확인
        const devices =
          await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        if (videoDevices.length === 0) {
          setCameraError("사용 가능한 카메라가 없습니다.");
          setHasCameraDevice(false);
          return;
        } else {
          setHasCameraDevice(true);
        }

        // 카메라 제약 조건 설정
        const constraints: MediaStreamConstraints = {
          video:
            videoDevices.length > 1
              ? {
                  facingMode: isFrontCamera
                    ? "user"
                    : "environment",
                }
              : true, // 카메라가 하나만 있으면 facingMode 없이 요청
          audio: false,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(
            constraints,
          );

        setStream(newStream);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error: any) {
        console.error("카메라 접근 실패:", error);

        if (error.name === "NotFoundError") {
          setCameraError(
            "카메라를 찾을 수 없습니다. 갤러리에서 사진을 업로드해주세요.",
          );
        } else if (error.name === "NotAllowedError") {
          setCameraError("카메라 접근 권한이 거부되었습니다.");
        } else {
          setCameraError(
            "카메라를 시작할 수 없습니다. 갤러리를 이용해주세요.",
          );
        }
      }
    };

    startCamera();

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [permissionsGranted, isFrontCamera]);

  // 카메라 권한 허용
  const handleCameraPermissionAllow = () => {
    setShowCameraPermission(false);
    // 카메라 권한 허용 후 갤러리 권한 팝업 표시
    setShowGalleryPermission(true);
  };

  // 갤러리 권한 허용
  const handleGalleryPermissionAllow = () => {
    setShowGalleryPermission(false);
    // 모든 권한 허용 후 카메라 시작
    setPermissionsGranted(true);
  };

  // 카메라/갤러리 권한 거부
  const handlePermissionDeny = () => {
    setShowCameraPermission(false);
    setShowGalleryPermission(false);
    // 권한 거부 시 뒤로 가기
    onBack();
  };

  // 사진 촬영 또는 편집 모드 전환
  const handleCapture = () => {
    if (isUploadMode) {
      // 이미지가 없으면 경고 팝업 표시
      if (!selectedImage) {
        setShowNoImageAlert(true);
        return;
      }

      // 업로드 모드일 때 - 필터가 적용된 이미지 생성 후 업로드
      console.log("사진 업로드:", selectedImage);

      // 선택된 필터 가져오기
      const filterStyle =
        ORIGINAL_FILTERS.find((f) => f.name === selectedFilter)
          ?.filter || "none";

      // 필터가 "Normal"이 아니면 Canvas를 사용하여 필터 적용된 이미지 생성
      if (filterStyle !== "none" && selectedImage) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // CORS 문제 방지
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Canvas context에 필터 적용
            ctx.filter = filterStyle;
            ctx.drawImage(img, 0, 0);

            // 필터가 적용된 이미지를 dataURL로 변환
            const filteredImageUrl = canvas.toDataURL(
              "image/jpeg",
              0.95,
            );

            // 업로드 실행
            onUpload({
              image: filteredImageUrl,
              caption: textInput,
              textOverlay: textInput,
              location: locationInput,
              weather: weatherInput,
              time: timeInput,
              health: healthInput,
            });

            // 성공 토스트 표시
            toast.success("업로드 되었습니다!");
          }
        };
        img.src = selectedImage;
      } else {
        // 필터가 "Normal"이면 원본 이미지 그대로 업로드
        onUpload({
          image: selectedImage!,
          caption: textInput,
          textOverlay: textInput,
          location: locationInput,
          weather: weatherInput,
          time: timeInput,
          health: healthInput,
        });

        // 성공 토스트 표시
        toast.success("업로드 되었습니다!");
      }

      return;
    }

    // 촬영 모드일 때
    // 카메라가 있는 경우: 실제 카메라 캡처
    if (hasCameraDevice && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSelectedImage(reader.result as string);
              setIsUploadMode(true);
              // 카메라 스트림 정리
              if (stream) {
                stream
                  .getTracks()
                  .forEach((track) => track.stop());
                setStream(null);
              }
            };
            reader.readAsDataURL(blob);
          }
        }, "image/jpeg");
      }
    } else {
      // 카메라가 없는 경우: 갤러리 열기 유도
      toast.error("카메라를 사용할 수 없습니다. 갤러리에서 사진을 선택해주세요.");
    }
  };

  // 카메라 전환
  const handleCameraSwitch = () => {
    setIsFrontCamera((prev) => !prev);
  };

  // 갤러리에서 이미지 선택
  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsUploadMode(true);
        // 이미지를 선택하면 스트림 정리 (카메라 끄기)
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 입력하기 버튼 (업로드 모드에서) -> 세부조정 모드로 전환
  const handleEdit = () => {
    setIsDetailEditMode(true);
  };

  // 세부조정 모드 종료
  const handleCloseDetailEdit = () => {
    setIsDetailEditMode(false);
  };

  // 세부조정 버튼 핸들러들
  const handleTextInput = () => {
    // 텍스트 입력 모드 토글
    if (showTextInput) {
      // 현재 입력 중이면 입력 완료
      setShowTextInput(false);
    } else {
      // 입력 모드 활성화 및 포커스
      setShowTextInput(true);
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  const handleLocationInput = () => {
    // Mock 위치 데이터 설정
    setLocationInput("서울시 강남구");
  };

  const handleWeatherInput = () => {
    // Mock 날씨 데이터 설정
    setWeatherInput("맑음 • 22°C");
  };

  const handleTimeInput = () => {
    // 현재 날짜를 년.월.일 형식으로 설정
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setTimeInput(`${year}.${month}.${day}`);
  };

  const handleHealthInput = () => {
    setShowHealthModal(true);
  };

  const handleHealthRecordSelect = (record: string) => {
    setHealthInput(record);
    setShowHealthModal(false);
  };

  // 필터 버튼 (업로드 모드에서)
  const handleFilter = () => {
    // 필터 선택 화면으로 전환
    setIsFilterMode(true);
    setPreviousFilter(selectedFilter); // 현재 필터 저장
  };

  return (
    <>
      {/* 카메라 권한 팝업 (기존 유지) */}
      <AlertDialog open={showCameraPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              카메라 권한 허용
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진을 촬영하려면 카메라 접근 권한이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePermissionDeny}>
              거부
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCameraPermissionAllow}
            >
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 갤러리 권한 팝업 (기존 유지) */}
      <AlertDialog open={showGalleryPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              갤러리 권한 허용
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진을 업로드하려면 갤러리 접근 권한이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePermissionDeny}>
              거부
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGalleryPermissionAllow}
            >
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 업로드 화면 */}
      <div className="relative w-full h-screen bg-white overflow-hidden">
        {/* -------------------- [수정된 부분: 카메라 뷰 사이즈 및 스타일 조정] -------------------- */}
        <div
          // Layer 1: Vertical constraint container (pt-20, pb-[120px])
          className="absolute left-0 right-0 top-0 bottom-0 pt-20 pb-[120px] flex justify-center items-center overflow-hidden"
        >
          <div
            // Layer 2: Horizontal margin/padding (px-4)
            className="w-full h-full flex justify-center items-center px-4"
          >
            <div
              // Layer 3: Actual Camera/Post Box (h-[85%], w-full, shadow-lg, rounded-2xl)
              className="relative h-[85%] w-full bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* 카메라 화면 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* 선택된 이미지 표시 */}
              {selectedImage && (
                <div className="absolute inset-0 bg-white">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Selected Image"
                    className="w-full h-full object-cover"
                    style={{
                      filter:
                        ORIGINAL_FILTERS.find(
                          (f) => f.name === selectedFilter,
                        )?.filter || "none",
                    }}
                  />

                  {/* 텍스트 입력 시 어두운 오버레이 */}
                  {showTextInput && (
                    <div className="absolute inset-0 bg-black/50" />
                  )}

                  {/* 왼쪽 상단 정보 오버레이 (위치/날씨/시간/건강) */}
                  {(locationInput ||
                    weatherInput ||
                    timeInput ||
                    healthInput) && (
                    <div className="absolute top-4 left-4 flex flex-row flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                      {locationInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <MapPin
                            size={16}
                            className="text-white"
                          />
                          <span className="text-white text-sm">
                            {locationInput}
                          </span>
                        </div>
                      )}
                      {weatherInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Cloud
                            size={16}
                            className="text-white"
                          />
                          <span className="text-white text-sm">
                            {weatherInput}
                          </span>
                        </div>
                      )}
                      {timeInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Clock
                            size={16}
                            className="text-white"
                          />
                          <span className="text-white text-sm">
                            {timeInput}
                          </span>
                        </div>
                      )}
                      {healthInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Heart
                            size={16}
                            className="text-white"
                          />
                          <span className="text-white text-sm">
                            {healthInput}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 하단 텍스트 오버레이 - 입력창으로 변경 */}
                  <div className="absolute bottom-20 left-4 right-4">
                    {showTextInput ? (
                      <input
                        ref={textInputRef}
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setShowTextInput(false);
                            textInputRef.current?.blur();
                          }
                        }}
                        placeholder="텍스트를 입력하세요"
                        className="w-full text-black text-lg bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md outline-none focus:ring-2 focus:ring-[#36D2C5] placeholder:text-gray-500/70"
                      />
                    ) : textInput ? (
                      <div className="w-full text-black text-lg bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md">
                        {textInput}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* 카메라 에러 메시지 */}
              {cameraError && !selectedImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                  <div className="text-center px-6">
                    <Camera
                      size={48}
                      className="text-gray-400 mx-auto mb-4"
                    />
                    <p className="text-white mb-2">
                      {cameraError}
                    </p>
                    <p className="text-gray-400 text-sm">
                      갤러리 버튼을 눌러 사진을 업로드할 수
                      있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ------------------------------------------------------------------------- */}

        {/* 상단 Header (fixed) */}
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-center w-full bg-white max-w-[500px] mx-auto min-h-[110px]">
          {isFilterMode ? (
            /* 필터 모드일 때: 뒤로가기(취소) + 완료 버튼 */
            <>
              <button
                onClick={() => {
                  // 이전 필터로 복원
                  setSelectedFilter(previousFilter);
                  setIsFilterMode(false);
                }}
                className="absolute left-4 p-1"
              >
                <ArrowLeft size={24} className="text-[#1A1A1A]" />
              </button>
              <button
                onClick={() => setIsFilterMode(false)}
                className="absolute right-4 px-4 py-2 text-[#36D2C5] font-semibold"
              >
                완료
              </button>
            </>
          ) : isDetailEditMode ? (
            <button
              onClick={handleCloseDetailEdit}
              className="absolute left-4 p-1"
            >
              <X size={24} className="text-[#1A1A1A]" />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="absolute left-4 p-1"
            >
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
          )}
          <h1 className="text-xl font-bold text-[#1A1A1A] text-center">
            {isFilterMode
              ? "필터"
              : isDetailEditMode
                ? "세부조정"
                : "업로드"}
          </h1>
        </header>

        {/* 하단 버튼 영역 (fixed) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pt-4 pb-10 bg-white max-w-[500px] mx-auto">
          {/* 숨겨진 파일 input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {isFilterMode ? (
            /* 필터 모드: 필터 슬라이더만 표시, 버튼 숨김 */
            <div className="w-full h-28 relative flex items-center justify-center">
              {/* 가운데 고정된 원형 테두리 (민트색) */}
              {/* z-30으로 높여서 슬라이더 위에 표시 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="w-[68px] h-[68px] rounded-full border-[3px] border-[#36D2C5]" />
              </div>

              {/* 필터 슬라이더 */}
              <div className="w-full h-full z-20">
                <Swiper
                  spaceBetween={14} // 간격 조정
                  slidesPerView="auto"
                  className="w-full h-full"
                  // [수정] 정식 루프 기능 사용, 가짜 데이터 대신 루프 사용
                  loop={true}
                  centeredSlides={true}
                  slideToClickedSlide={true} // 클릭 시 이동 지원
                  threshold={10}
                  speed={400}
                  // [수정] onRealIndexChange를 사용하여 실제 필터 인덱스 계산
                  onRealIndexChange={(swiper) => {
                    const realIndex =
                      swiper.realIndex %
                      ORIGINAL_FILTERS.length;
                    setSelectedFilter(
                      ORIGINAL_FILTERS[realIndex].name,
                    );
                  }}
                >
                  {/* [수정] 3배 복제된 데이터 사용 (루프 버퍼 확보) */}
                  {loopFilters.map((filter, index) => (
                    <SwiperSlide
                      // [중요] key는 유니크하게
                      key={`${filter.name}-${index}`}
                      style={{
                        width: "auto",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {({ isActive }) => (
                        <button
                          // [수정] isActive를 사용하여 스타일 적용 (깜빡임 방지)
                          // onClick 제거 (Swiper가 처리)
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide select-none transition-all duration-200 ${
                            isActive
                              ? "bg-white text-gray-900 shadow-sm scale-100"
                              : "bg-[#EEEEEE] text-gray-400 scale-95"
                          }`}
                        >
                          {filter.name.toUpperCase()}
                        </button>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          ) : isDetailEditMode ? (
            /* 세부조정 모드: 5개 동그란 아이콘 버튼(위) + 업로드 버튼(아래 중앙) */
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto px-4">
              {/* 5개 세부조정 아이콘 버튼 */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleTextInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E7F3FF] text-[#2F80ED] transition-colors hover:bg-[#D0E7FF]">
                    <Type size={24} />
                  </div>
                  <span className="text-xs text-gray-600">
                    텍스트
                  </span>
                </button>

                <button
                  onClick={handleLocationInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFF4E5] text-[#FF9800] transition-colors hover:bg-[#FFE8CC]">
                    <MapPin size={24} />
                  </div>
                  <span className="text-xs text-gray-600">
                    위치
                  </span>
                </button>

                <button
                  onClick={handleWeatherInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E8F8F7] text-[#36D2C5] transition-colors hover:bg-[#D0F0ED]">
                    <Cloud size={24} />
                  </div>
                  <span className="text-xs text-gray-600">
                    날씨
                  </span>
                </button>

                <button
                  onClick={handleTimeInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#F3E5F5] text-[#9C27B0] transition-colors hover:bg-[#E1BEE7]">
                    <Clock size={24} />
                  </div>
                  <span className="text-xs text-gray-600">
                    시간
                  </span>
                </button>

                <button
                  onClick={handleHealthInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFEBEE] text-[#F44336] transition-colors hover:bg-[#FFCDD2]">
                    <Heart size={24} />
                  </div>
                  <span className="text-xs text-gray-600">
                    건강
                  </span>
                </button>
              </div>

              {/* 업로드 버튼 (중앙) */}
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-gray-100 bg-[#36D2C5] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
              >
                <Upload size={28} className="text-white" />
              </button>
            </div>
          ) : (
            /* 기본 모드: 3개 버튼 (갤러리/촬영/카메라전환 또는 입력하기/업로드/필터) */
            <div className="flex items-center justify-between max-w-md mx-auto px-6">
              {/* 왼쪽 버튼 - 촬영 모드: 갤러리, 업로드 모드: 입력하기 */}
              <button
                onClick={
                  isUploadMode
                    ? handleEdit
                    : () => fileInputRef.current?.click()
                }
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              >
                {isUploadMode ? (
                  <Edit size={32} className="" />
                ) : (
                  <ImageIcon size={32} className="" />
                )}
              </button>

              {/* 가운데 버튼 - 촬영 모드: 촬영, 업로드 모드: 업로드 */}
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-gray-100 bg-[#36D2C5] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
              >
                {isUploadMode ? (
                  <Upload size={28} className="text-white" />
                ) : (
                  <div className="w-14 h-14 rounded-full border-4 border-white" />
                )}
              </button>

              {/* 오른쪽 버튼 - 촬영 모드: 카메라 전환, 업로드 모드: 필터 */}
              <button
                onClick={
                  isUploadMode
                    ? handleFilter
                    : handleCameraSwitch
                }
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors"
              >
                {isUploadMode ? (
                  <Sparkles size={32} className="" />
                ) : (
                  <RefreshCw size={32} className="" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 건강기록 선택 모달 - 하단 슬라이드 업 */}
      <AnimatePresence>
        {showHealthModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowHealthModal(false)}
            />

            {/* 모달 창 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="relative w-full max-w-[500px] bg-white rounded-t-2xl p-6 shadow-2xl"
            >
              {/* 3단 구성: 운동 / 감정 / 챌린지 */}
              <div className="space-y-6">
                {/* 1. 오늘 운동 기록 */}
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    오늘 운동 기록
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onClick={() =>
                        handleHealthRecordSelect("걸음수 8,542보")
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Footprints
                        size={16}
                        className="text-gray-300"
                      />
                      <span className="text-[15px] font-medium">
                        걸음수
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "소모칼로리 450kcal",
                        )
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Flame
                        size={16}
                        className="text-orange-400"
                        fill="currentColor"
                      />
                      <span className="text-[15px] font-medium">
                        소모칼로리
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect("오른층수 12층")
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <TrendingUp
                        size={16}
                        className="text-yellow-500"
                      />
                      <span className="text-[15px] font-medium">
                        오른층수
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. 오늘 감정 기록 */}
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    오늘 감정 기록
                  </h3>
                  <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {["😄", "😊", "😐", "😔", "😫", "😢", "😭"].map(
                      (emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleHealthRecordSelect(
                              `오늘의 기분 ${emoji}`,
                            )
                          }
                          className="w-11 h-11 flex items-center justify-center bg-[#555555] rounded-full text-2xl shrink-0 hover:bg-[#444444] transition-colors"
                        >
                          {emoji}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* 3. 진행 중인 챌린지 */}
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    진행 중인 챌린지
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "챌린지: 5만보 걷기",
                        )
                      }
                      className="flex items-center gap-2 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <span className="text-lg">👟</span>
                      <span className="text-[15px] font-medium">
                        5만보 걷기
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "챌린지: 주 1회 함께 걷기",
                        )
                      }
                      className="flex items-center gap-2 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <span className="text-lg">👥</span>
                      <span className="text-[15px] font-medium">
                        주 1회 함께 걷기
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "챌린지: 건강 식단",
                        )
                      }
                      className="flex items-center gap-2 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <span className="text-lg">🥗</span>
                      <span className="text-[15px] font-medium">
                        건강 식단
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 이미지가 선택되지 않았을 때 알림 모달 */}
      <AlertDialog open={showNoImageAlert}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              이미지 선택 필요
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진을 선택하거나 촬영한 후 업로드할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowNoImageAlert(false)}>
              닫기
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
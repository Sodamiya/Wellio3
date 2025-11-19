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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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

export function UploadPage({ onBack, onUpload }: UploadPageProps) {
  const [showCameraPermission, setShowCameraPermission] =
    useState(false);
  const [showGalleryPermission, setShowGalleryPermission] =
    useState(false);
  const [permissionsGranted, setPermissionsGranted] =
    useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
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
  const [hasCameraDevice, setHasCameraDevice] = useState<boolean | null>(null);
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);

  // 세부 입력 state
  const [textInput, setTextInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [weatherInput, setWeatherInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [healthInput, setHealthInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  // 필터 모드 state
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Normal");

  // 필터 목록
  const filters = [
    { name: "Normal", filter: "none" },
    { name: "Fade", filter: "brightness(1.1) contrast(0.85) saturate(0.9) sepia(0.05)" },
    { name: "Paris", filter: "brightness(1.15) contrast(0.95) saturate(1.0) sepia(0.08) blur(0.3px)" },
    { name: "Lapis", filter: "brightness(1.0) contrast(1.08) saturate(1.1) hue-rotate(10deg)" },
    { name: "Kilda", filter: "brightness(1.0) contrast(1.2) saturate(1.25) hue-rotate(-5deg)" },
    { name: "Still", filter: "brightness(1.0) contrast(1.0) saturate(0.5) grayscale(0.3)" },
    { name: "Simple", filter: "brightness(1.08) contrast(1.0) saturate(1.0)" },
  ];

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // 업로드 모드일 때 - 실제 업로드 처리
      console.log("사진 업로드:", selectedImage);
      // TODO: 실제 업로드 로직 구현
      onUpload({
        image: selectedImage!,
        caption: textInput,
        textOverlay: textInput,
        location: locationInput,
        weather: weatherInput,
        time: timeInput,
        health: healthInput,
      });
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
                stream.getTracks().forEach((track) => track.stop());
                setStream(null);
              }
            };
            reader.readAsDataURL(blob);
          }
        }, "image/jpeg");
      }
    } else {
      // 카메라가 없는 경우: 임의의 이미지 사용
      const randomImageUrl = `https://source.unsplash.com/800x600/?medical,health,hospital&${Date.now()}`;
      
      setSelectedImage(randomImageUrl);
      setIsUploadMode(true);
      
      // 카메라 스트림 정리 (혹시 있다면)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
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
    setShowTextInput(true);
    // focus를 위해 약간의 지연
    setTimeout(() => textInputRef.current?.focus(), 100);
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
                      filter: filters.find(f => f.name === selectedFilter)?.filter || "none"
                    }}
                  />
                  
                  {/* 텍스트 입력 시 어두운 오버레이 */}
                  {showTextInput && (
                    <div className="absolute inset-0 bg-black/50" />
                  )}

                  {/* 왼쪽 상단 정보 오버레이 (위치/날씨/시간/건강) */}
                  {(locationInput || weatherInput || timeInput || healthInput) && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {locationInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <MapPin size={16} className="text-white" />
                          <span className="text-white text-sm">{locationInput}</span>
                        </div>
                      )}
                      {weatherInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Cloud size={16} className="text-white" />
                          <span className="text-white text-sm">{weatherInput}</span>
                        </div>
                      )}
                      {timeInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Clock size={16} className="text-white" />
                          <span className="text-white text-sm">{timeInput}</span>
                        </div>
                      )}
                      {healthInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Heart size={16} className="text-white" />
                          <span className="text-white text-sm">{healthInput}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 하단 텍스트 오버레이 */}
                  {textInput && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-lg bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg">
                        {textInput}
                      </p>
                    </div>
                  )}
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
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-center w-full bg-white max-w-[500px] mx-auto">
          {isFilterMode ? (
            /* 필터 모드일 때: 완료 버튼 */
            <button
              onClick={() => setIsFilterMode(false)}
              className="absolute left-4 px-4 py-2 text-[#36D2C5]"
            >
              완료
            </button>
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
            {isFilterMode ? "필터" : isDetailEditMode ? "세부조정" : "업로드"}
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
            <div className="w-full relative pb-4">
              {/* 가운데 고정된 원형 테두리 */}
              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 pointer-events-none">
                <div className="w-20 h-20 rounded-full border-4 border-[#36D2C5]" />
              </div>

              {/* 필터 슬라이더 */}
              <div className="px-4">
                <Swiper
                  spaceBetween={16}
                  slidesPerView="auto"
                  className="w-full"
                  loop={true}
                  centeredSlides={true}
                  initialSlide={0}
                  onSlideChange={(swiper) => {
                    const realIndex = swiper.realIndex % filters.length;
                    setSelectedFilter(filters[realIndex].name);
                  }}
                >
                  {/* 필터를 3번 반복해서 충분한 슬라이드 확보 */}
                  {[...filters, ...filters, ...filters].map((filter, index) => {
                    const isSelected = selectedFilter === filter.name;
                    return (
                      <SwiperSlide key={`${filter.name}-${index}`} style={{ width: 'auto' }}>
                        <button
                          onClick={() => {
                            setSelectedFilter(filter.name);
                          }}
                          className="flex flex-col items-center gap-2 pt-2"
                        >
                          {/* 필터 미리보기 */}
                          <div
                            className={`rounded-full overflow-hidden transition-all ${
                              isSelected 
                                ? 'w-20 h-20' 
                                : 'w-16 h-16 opacity-60'
                            }`}
                          >
                            {selectedImage ? (
                              <ImageWithFallback
                                src={selectedImage}
                                alt={filter.name}
                                className="w-full h-full object-cover"
                                style={{ filter: filter.filter }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            )}
                          </div>
                          {/* 필터 이름 */}
                          <span 
                            className={`text-xs transition-colors ${
                              isSelected ? 'text-[#36D2C5]' : 'text-gray-600'
                            }`}
                          >
                            {filter.name}
                          </span>
                        </button>
                      </SwiperSlide>
                    );
                  })}
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
                  <span className="text-xs text-gray-600">텍스트</span>
                </button>

                <button
                  onClick={handleLocationInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFF4E5] text-[#FF9800] transition-colors hover:bg-[#FFE8CC]">
                    <MapPin size={24} />
                  </div>
                  <span className="text-xs text-gray-600">위치</span>
                </button>

                <button
                  onClick={handleWeatherInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E8F8F7] text-[#36D2C5] transition-colors hover:bg-[#D0F0ED]">
                    <Cloud size={24} />
                  </div>
                  <span className="text-xs text-gray-600">날씨</span>
                </button>

                <button
                  onClick={handleTimeInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#F3E5F5] text-[#9C27B0] transition-colors hover:bg-[#E1BEE7]">
                    <Clock size={24} />
                  </div>
                  <span className="text-xs text-gray-600">시간</span>
                </button>

                <button
                  onClick={handleHealthInput}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFEBEE] text-[#F44336] transition-colors hover:bg-[#FFCDD2]">
                    <Heart size={24} />
                  </div>
                  <span className="text-xs text-gray-600">건강</span>
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
                onClick={isUploadMode ? handleEdit : () => fileInputRef.current?.click()}
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
                onClick={isUploadMode ? handleFilter : handleCameraSwitch}
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

      {/* 텍스트 입력 모달 (하단에서 슬라이드 업) */}
      {showTextInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowTextInput(false)}
          />
          
          {/* 입력 창 */}
          <div className="relative w-full max-w-[500px] bg-white rounded-t-2xl p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Type size={24} className="text-[#2F80ED]" />
              <h3 className="text-lg">텍스트 입력</h3>
            </div>
            
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="사진에 추가할 텍스트를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36D2C5] mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-3 bg-[#36D2C5] text-white rounded-lg hover:bg-[#00C2B3] transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 건강기록 선택 모달 */}
      <AlertDialog open={showHealthModal} onOpenChange={setShowHealthModal}>
        <AlertDialogContent className="max-w-[380px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Heart size={20} className="text-[#F44336]" />
              건강기록 선택
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진에 추가할 건강기록을 선택하세요
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col gap-2 py-4">
            <button
              onClick={() => handleHealthRecordSelect("걸음수 8,542보")}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFEBEE] rounded-full flex items-center justify-center">
                  <span className="text-lg">🚶</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">걸음수</p>
                  <p className="text-sm text-gray-500">8,542보</p>
                </div>
              </div>
              <Check size={20} className="text-[#36D2C5]" />
            </button>

            <button
              onClick={() => handleHealthRecordSelect("심박수 72 BPM")}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFEBEE] rounded-full flex items-center justify-center">
                  <Heart size={20} className="text-[#F44336]" />
                </div>
                <div className="text-left">
                  <p className="font-medium">심박수</p>
                  <p className="text-sm text-gray-500">72 BPM</p>
                </div>
              </div>
              <Check size={20} className="text-[#36D2C5]" />
            </button>

            <button
              onClick={() => handleHealthRecordSelect("수면 7시간 30분")}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFEBEE] rounded-full flex items-center justify-center">
                  <span className="text-lg">😴</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">수면</p>
                  <p className="text-sm text-gray-500">7시간 30분</p>
                </div>
              </div>
              <Check size={20} className="text-[#36D2C5]" />
            </button>

            <button
              onClick={() => handleHealthRecordSelect("칼로리 1,850 kcal")}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFEBEE] rounded-full flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">칼로리</p>
                  <p className="text-sm text-gray-500">1,850 kcal</p>
                </div>
              </div>
              <Check size={20} className="text-[#36D2C5]" />
            </button>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowHealthModal(false)}>
              취소
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
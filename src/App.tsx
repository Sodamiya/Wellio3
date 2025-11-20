import { useState } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SocialLoginPage } from "./components/SocialLoginPage";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { HospitalSearchPage } from "./components/HospitalSearchPage";
import { CommunityPage } from "./components/CommunityPage";
import { ProfilePage } from "./components/ProfilePage"; // 👈 1. ProfilePage import
import { HospitalDetailPage } from "./components/HospitalDetailPage"; // 👈 HospitalDetailPage import
import { UploadPage } from "./components/UploadPage"; // 👈 UploadPage import
import { MedicalHistoryPage } from "./components/MedicalHistoryPage"; // 👈 MedicalHistoryPage import
import { MyReviewsPage } from "./components/MyReviewsPage"; // 👈 MyReviewsPage import
import { FavoriteHospitalsPage } from "./components/FavoriteHospitalsPage"; // 👈 FavoriteHospitalsPage import
import { NotificationPage } from "./components/NotificationPage"; // 👈 NotificationPage import
import { OnboardingPage } from "./components/OnboardingPage"; // 👈 OnboardingPage import
import { ReviewWritePage } from "./components/ReviewWritePage"; // 👈 ReviewWritePage import
import { HospitalReviewsPage } from "./components/HospitalReviewsPage"; // 👈 HospitalReviewsPage import
import { Toaster } from "sonner@2.0.3"; // 👈 Toaster import

type Page = "home" | "community" | "hospital" | "profile" | "hospital-detail" | "upload" | "medical-history" | "my-reviews" | "favorite-hospitals" | "notifications" | "write-review" | "hospital-reviews";

// 병원 타입 정의
interface Hospital {
  id: number;
  name: string;
  department: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

// 포스트 타입 정의
interface Post {
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
}

// 리뷰 타입 정의
interface Review {
  id: number;
  hospitalId: number;
  hospitalName: string;
  hospitalImage: string;
  visitDate: string;
  rating: number;
  keywords: string[];
  reviewText: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  likes?: number;
  visitType?: "첫방문" | "재방문";
}

export default function App() {
  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 온보딩 상태 관리
  const [showOnboarding, setShowOnboarding] = useState(false);
  // 로그인 플로우 상태: 'welcome' | 'social' | 'email'
  const [loginStep, setLoginStep] = useState<'welcome' | 'social' | 'email'>('welcome');
  const [userName, setUserName] = useState("김건강");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  
  // 알림 페이지에서 돌아갈 페이지 추적
  const [previousPage, setPreviousPage] = useState<Page>("home");
  
  // 찜한 병원 목록 관리
  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>([]);
  
  // 리뷰 작성한 병원 ID 목록 관리
  const [reviewedHospitals, setReviewedHospitals] = useState<number[]>([]);
  
  // 작성한 리뷰 목록 관리
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  
  // 샘플 리뷰 데이터 (모든 병원에 표시될 기본 리뷰)
  const sampleReviews = [
    // 매일건강의원 (id: 1) - 기존 3개 유지
    {
      id: 9001,
      hospitalId: 1, // 매일건강의원
      hospitalName: "매일건강의원",
      hospitalImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
      visitDate: "2025.05.22",
      rating: 5,
      keywords: ["진료 만족해요", "친절해요"],
      reviewText: "목이 아프고 근육통이 심해서 방문했는데 친절하게 진료 잘 봐주셔서 좋았습니다! 목 상태 확인하시고 간단한 증상 상담 후 약 처방해 주셨어요. 처방받은 약 먹고 한숨 잤더니 한결 개운해졌습니다.\n\n갑자기 아파서 가장 가까운 데로 바로 접수 후에 대기 없이 진료받을 수 있었어요. 기운 없었는데 빨리 진료 끝나서 만족합니다. 서초동 근처에 병원 찾으시면 추천해요 ㅎㅎ",
      userName: "김**님",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      createdAt: "2025-05-22T10:30:00Z",
      likes: 6,
      visitType: "첫방문",
    },
    {
      id: 9002,
      hospitalId: 1, // 매일건강의원
      hospitalName: "매일건강의원",
      hospitalImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
      visitDate: "2025.01.29",
      rating: 5,
      keywords: ["진료 만족해요", "재진료 희망해요", "친절해요"],
      reviewText: "만족스러운 첫 방문! 이사 와서 처음 방문했는데, 앞으로 꾸준히 다닐 것 같습니다. 제 건강을 믿고 맡길 수 있는 주치의를 만난 것 같아 든든해요.",
      userName: "박**님",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      createdAt: "2025-01-29T14:20:00Z",
      likes: 15,
      visitType: "첫방문",
    },
    {
      id: 9003,
      hospitalId: 1, // 매일건강의원
      hospitalName: "매일건강의원",
      hospitalImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
      visitDate: "2024.12.10",
      rating: 4,
      keywords: ["대기시간이 짧아요", "친절해요"],
      reviewText: "항상 친절하게 맞아주셔서 감사합니다. 대기 시간이 짧아서 바쁜 직장인에게 딱이에요.",
      userName: "이**님",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      createdAt: "2024-12-10T16:45:00Z",
      likes: 2,
      visitType: "재방문",
    },
    // 365클리닉 강남본점 (id: 2) - 신규 3개
    {
      id: 9004,
      hospitalId: 2,
      hospitalName: "365클리닉 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      visitDate: "2025.03.15",
      rating: 5,
      keywords: ["시술 만족해요", "친절해요", "시설이 깨끗해요"],
      reviewText: "피부 레이저 시술 받았는데 정말 만족스러워요. 원장님께서 꼼꼼하게 상담해주시고 시술도 세심하게 해주셔서 좋았습니다. 시설도 깨끗하고 직원분들도 친절하세요!",
      userName: "최**님",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      createdAt: "2025-03-15T11:00:00Z",
      likes: 8,
      visitType: "첫방문",
    },
    {
      id: 9005,
      hospitalId: 2,
      hospitalName: "365클리닉 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      visitDate: "2025.02.20",
      rating: 4,
      keywords: ["재진료 희망해요", "시술 만족해요"],
      reviewText: "여드름 치료로 몇 번 방문했는데 점점 좋아지고 있어요. 꾸준히 다닐 예정입니다.",
      userName: "정**님",
      userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80",
      createdAt: "2025-02-20T15:30:00Z",
      likes: 4,
      visitType: "재방문",
    },
    {
      id: 9006,
      hospitalId: 2,
      hospitalName: "365클리닉 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      visitDate: "2025.01.10",
      rating: 5,
      keywords: ["친절해요", "시술 만족해요", "대기시간이 짧아요"],
      reviewText: "예약 시간 잘 지켜주셔서 대기 시간이 거의 없었어요. 피부 상담도 친절하게 해주시고 효과도 좋아서 만족합니다!",
      userName: "한**님",
      userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      createdAt: "2025-01-10T14:00:00Z",
      likes: 12,
      visitType: "첫방문",
    },
    // 사랑니쏙쏙 강남본점 (id: 3) - 신규 3개
    {
      id: 9007,
      hospitalId: 3,
      hospitalName: "사랑니쏙쏙 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      visitDate: "2025.04.05",
      rating: 5,
      keywords: ["진료 만족해요", "친절해요", "시설이 깨끗해요"],
      reviewText: "사랑니 발치 정말 잘 해주셔서 감사합니다. 생각보다 아프지 않았고 회복도 빨랐어요. 원장님이 매우 꼼꼼하시고 친절하셨습니다!",
      userName: "강**님",
      userAvatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80",
      createdAt: "2025-04-05T10:20:00Z",
      likes: 10,
      visitType: "첫방문",
    },
    {
      id: 9008,
      hospitalId: 3,
      hospitalName: "사랑니쏙쏙 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      visitDate: "2025.03.12",
      rating: 4,
      keywords: ["진료 만족해요", "대기시간이 짧아요"],
      reviewText: "예약제라 대기 시간이 짧아서 좋았어요. 사랑니 발치 후 붓기도 적고 통증도 거의 없었습니다.",
      userName: "윤**님",
      userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
      createdAt: "2025-03-12T16:00:00Z",
      likes: 5,
      visitType: "첫방문",
    },
    {
      id: 9009,
      hospitalId: 3,
      hospitalName: "사랑니쏙쏙 강남본점",
      hospitalImage: "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      visitDate: "2025.02.28",
      rating: 5,
      keywords: ["친절해요", "진료 만족해요", "재진료 희망해요"],
      reviewText: "처음엔 무서웠는데 원장님이 차근차근 설명해주셔서 안심하고 시술받을 수 있었어요. 다음에 다른 사랑니도 여기서 뽑으려고요!",
      userName: "임**님",
      userAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
      createdAt: "2025-02-28T11:30:00Z",
      likes: 7,
      visitType: "첫방문",
    },
    // 강남예쁜이치과의원 (id: 4) - 신규 3개
    {
      id: 9010,
      hospitalId: 4,
      hospitalName: "강남예쁜이치과의원",
      hospitalImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      visitDate: "2025.05.01",
      rating: 5,
      keywords: ["시술 만족해요", "친절해요", "시설이 깨끗해요"],
      reviewText: "라미네이트 시술 받았는데 결과가 정말 만족스러워요. 상담부터 시술까지 모든 과정이 체계적이고 친절했습니다. 가격 대비 효과 최고!",
      userName: "송**님",
      userAvatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80",
      createdAt: "2025-05-01T13:45:00Z",
      likes: 18,
      visitType: "첫방문",
    },
    {
      id: 9011,
      hospitalId: 4,
      hospitalName: "강남예쁜이치과의원",
      hospitalImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      visitDate: "2025.04.20",
      rating: 5,
      keywords: ["친절해요", "진료 만족해요", "재진료 희망해요"],
      reviewText: "임플란트 상담 받으러 갔는데 원장님이 정말 자세하게 설명해주셨어요. 다른 곳보다 훨씬 신뢰가 갑니다. 여기서 진행하기로 결정했어요!",
      userName: "오**님",
      userAvatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
      createdAt: "2025-04-20T10:15:00Z",
      likes: 9,
      visitType: "첫방문",
    },
    {
      id: 9012,
      hospitalId: 4,
      hospitalName: "강남예쁜이치과의원",
      hospitalImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      visitDate: "2025.03.28",
      rating: 4,
      keywords: ["시설이 깨끗해요", "시술 만족해요"],
      reviewText: "치아 미백 받았는데 시설이 정말 깨끗하고 좋아요. 효과도 만족스럽습니다. 다만 가격이 조금 있는 편이에요.",
      userName: "장**님",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      createdAt: "2025-03-28T14:50:00Z",
      likes: 6,
      visitType: "재방문",
    },
  ];

  // 병원별 리뷰 개수를 계산하는 함수
  const getHospitalReviewCount = (hospitalId: number): number => {
    const sampleCount = sampleReviews.filter(review => review.hospitalId === hospitalId).length;
    const userCount = myReviews.filter(review => review.hospitalId === hospitalId).length;
    return sampleCount + userCount;
  };
  
  // 병원별 평균 별점을 계산하는 함수
  const getHospitalAverageRating = (hospitalId: number): number => {
    const hospitalReviews = [
      ...sampleReviews.filter(review => review.hospitalId === hospitalId),
      ...myReviews.filter(review => review.hospitalId === hospitalId)
    ];
    
    if (hospitalReviews.length === 0) return 0;
    
    const totalRating = hospitalReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / hospitalReviews.length) * 10) / 10; // 소수점 첫째자리까지
  };
  
  // 병원별 키워드 통계를 계산하는 함수
  const getHospitalKeywordStats = (hospitalId: number): Array<{ keyword: string; count: number; percentage: number }> => {
    const hospitalReviews = [
      ...sampleReviews.filter(review => review.hospitalId === hospitalId),
      ...myReviews.filter(review => review.hospitalId === hospitalId)
    ];
    
    // 모든 키워드 수집
    const keywordCount: { [key: string]: number } = {};
    hospitalReviews.forEach(review => {
      review.keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });
    
    // 총 리뷰 개수
    const totalReviews = hospitalReviews.length;
    
    // 키워드 통계 배열 생성 및 정렬 (개수 많은 순)
    const stats = Object.entries(keywordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    return stats;
  };
  
  // 진료내역에서 선택한 진료 기록 관리
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<{
    id: number;
    hospitalName: string;
    visitDate: string;
    visitTime: string;
  } | null>(null);

  // 커뮤니티 포스트 state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
      badge: "🏆 주 1회 함께 걷기",
      userAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      caption: "챌린지 첫 시작!",
      userName: "김건강",
      textOverlay: "오늘부터 시작하는 건강한 습관!",
      comments: [
        {
          userName: "박활력",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
          text: "멋져요! 저도 함께할게요 💪",
          timestamp: "5분 전"
        },
        {
          userName: "이평화",
          userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
          text: "화이팅하세요!",
          timestamp: "2분 전"
        }
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: "박활력",
              userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
            },
            {
              userName: "이평화",
              userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
            }
          ]
        },
        {
          emoji: "👍",
          users: [
            {
              userName: "정활동",
              userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      badge: "💪 매일 운동하기",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      caption: "오늘도 달렸어요!",
      userName: "박활력",
      location: "한강공원",
      time: "오전 6:30",
      weather: "맑음 18°C",
      comments: [
        {
          userName: "김건강",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "역시 박활력님! 👏",
          timestamp: "10분 전"
        }
      ],
      reactions: [
        {
          emoji: "🔥",
          users: [
            {
              userName: "김건강",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            },
            {
              userName: "이평화",
              userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      badge: "🧘‍♀️ 매일 요가",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      caption: "마음 챙기기",
      userName: "이평화",
      textOverlay: "하루를 평화롭게 시작하는 아침 요가",
      health: "혈압 120/80",
      comments: [
        {
          userName: "김건강",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "평화로운 하루 되세요 🙏",
          timestamp: "1시간 전"
        },
        {
          userName: "박활력",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
          text: "너무 좋아 보여요!",
          timestamp: "30분 전"
        },
        {
          userName: "정활동",
          userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
          text: "저도 요가 시작해볼까요?",
          timestamp: "15분 전"
        }
      ],
      reactions: [
        {
          emoji: "🧘‍♀️",
          users: [
            {
              userName: "박활력",
              userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
            }
          ]
        },
        {
          emoji: "💚",
          users: [
            {
              userName: "김건강",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            },
            {
              userName: "정활동",
              userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
            }
          ]
        }
      ]
    },
  ]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setCurrentPage("hospital-detail");
  };

  const handleUpload = (newPost: Omit<Post, "id" | "userName" | "userAvatar">) => {
    const post: Post = {
      ...newPost,
      id: posts.length + 1,
      userName: userName,
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    };
    setPosts([post, ...posts]); // 맨 앞에 추가
    setCurrentPage("community"); // 커뮤니티로 이동
  };

  // 찜한 병원 토글 함수
  const toggleFavorite = (hospital: any) => {
    const isFavorite = favoriteHospitals.some(h => h.id === hospital.id);
    if (isFavorite) {
      // 이미 찜한 병원이면 제거
      setFavoriteHospitals(favoriteHospitals.filter(h => h.id !== hospital.id));
    } else {
      // 찜하지 않은 병원이면 추가
      setFavoriteHospitals([...favoriteHospitals, hospital]);
    }
  };

  // 포스트 삭제 함수
  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  // 로그인 플로우 처리
  if (!isLoggedIn) {
    // Step 1: 환영 페이지
    if (loginStep === 'welcome') {
      return (
        <WelcomePage
          onGuestMode={() => {
            // 기본 계정으로 둘러보기 - 온보딩 시작
            setUserName("게스트");
            setIsLoggedIn(true);
            setShowOnboarding(true);
          }}
          onSignUp={() => {
            // 다른 방법으로 시작하기 - SNS 로그인 페이지로
            setLoginStep('social');
          }}
        />
      );
    }
    
    // Step 2: SNS 로그인 페이지
    if (loginStep === 'social') {
      return (
        <SocialLoginPage
          onBack={() => setLoginStep('welcome')}
          onEmailLogin={() => setLoginStep('email')}
        />
      );
    }
    
    // Step 3: 이메일 로그인 페이지
    if (loginStep === 'email') {
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  // 온보딩 화면 표시
  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentPage("home");
        }}
        userName={userName}
        posts={posts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex justify-center">
      <div className="w-full max-w-[500px] min-h-screen bg-white relative shadow-xl">
        {currentPage === "home" && (
          <HomePage
            userName={userName}
            currentPage={currentPage}
            onPageChange={(page) => {
              if (page === "notifications") {
                setPreviousPage("home");
              }
              setCurrentPage(page as Page);
            }}
            onHospitalClick={handleHospitalClick}
            getHospitalReviewCount={getHospitalReviewCount}
          />
        )}
        {currentPage === "hospital" && (
          <HospitalSearchPage
            onBack={() => setCurrentPage("home")}
            onHospitalClick={handleHospitalClick}
            favoriteHospitals={favoriteHospitals}
            onToggleFavorite={toggleFavorite}
            getHospitalReviewCount={getHospitalReviewCount}
          />
        )}
        {currentPage === "hospital-detail" && selectedHospital && (
          <HospitalDetailPage
            hospital={selectedHospital}
            onBack={() => setCurrentPage("hospital")}
            onReviewsClick={() => setCurrentPage("hospital-reviews")}
            reviewCount={getHospitalReviewCount(selectedHospital.id)}
            averageRating={getHospitalAverageRating(selectedHospital.id)}
            keywordStats={getHospitalKeywordStats(selectedHospital.id)}
          />
        )}
        {currentPage === "community" && (
          <CommunityPage
            onBack={() => setCurrentPage("home")}
            onUploadClick={() => setCurrentPage("upload")}
            onNotificationClick={() => {
              setPreviousPage("community");
              setCurrentPage("notifications");
            }}
            onDeletePost={handleDeletePost}
            posts={posts}
            currentUserName={userName} // 👈 현재 로그인된 사용자 이름 전달
          />
        )}
        {/* 👇 3. '준비중' 텍스트 대신 ProfilePage 컴포넌트로 교체 */}
        {currentPage === "profile" && (
          <ProfilePage
            userName={userName}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onBack={() => setCurrentPage("home")} // '뒤로가기' 누르면 홈으로
            onMyReviewsClick={() => setCurrentPage("my-reviews")}
            onFavoriteHospitalsClick={() => setCurrentPage("favorite-hospitals")}
          />
        )}
        {/* 👇 4. '업로드' 페이지 추가 */}
        {currentPage === "upload" && (
          <UploadPage
            onBack={() => setCurrentPage("community")}
            onUpload={handleUpload}
          />
        )}
        {/* 👇 5. '의료기록' 페이지 추가 */}
        {currentPage === "medical-history" && (
          <MedicalHistoryPage
            onBack={() => setCurrentPage("home")}
            onWriteReview={(record) => {
              // 선택한 진료 기록 저장
              setSelectedMedicalRecord({
                id: record.id,
                hospitalName: record.hospitalName,
                visitDate: record.visitDate,
                visitTime: record.visitTime,
              });
              // 리뷰 작성 페이지로 이동
              setCurrentPage("write-review");
            }}
            reviewedHospitals={reviewedHospitals}
            onViewReviews={() => setCurrentPage("my-reviews")}
          />
        )}
        {/* 👇 6. '내 리뷰' 페이지 추가 */}
        {currentPage === "my-reviews" && (
          <MyReviewsPage
            onBack={() => setCurrentPage("home")}
            reviews={myReviews}
          />
        )}
        {/* 👇 7. '즐겨찾는 병원' 페이지 추가 */}
        {currentPage === "favorite-hospitals" && (
          <FavoriteHospitalsPage
            onBack={() => setCurrentPage("home")}
            favoriteHospitals={favoriteHospitals}
            onToggleFavorite={toggleFavorite}
            getHospitalReviewCount={getHospitalReviewCount}
          />
        )}
        {/* 👇 8. '알림' 페이지 추가 */}
        {currentPage === "notifications" && (
          <NotificationPage
            onBack={() => {
              console.log("NotificationPage onBack clicked");
              setCurrentPage(previousPage);
            }}
          />
        )}
        {/* 👇 9. '리뷰 작성' 페이지 추가 */}
        {currentPage === "write-review" && selectedMedicalRecord && (
          <ReviewWritePage
            onBack={() => {
              // 뒤로가기 시 진료내역으로 이동
              setCurrentPage("medical-history");
            }}
            onComplete={(reviewData: Omit<Review, "id" | "createdAt">) => {
              // 새로운 리뷰 생성
              const newReview: Review = {
                ...reviewData,
                id: myReviews.length + 1,
                createdAt: new Date().toISOString(),
              };
              // 리뷰 목록에 추가
              setMyReviews([newReview, ...myReviews]);
              // 리뷰 작성한 병원 ID 추가
              setReviewedHospitals([...reviewedHospitals, reviewData.hospitalId]);
              // 나의후기 페이지로 이동
              setCurrentPage("my-reviews");
            }}
            userName={userName}
            hospitalName={selectedMedicalRecord.hospitalName}
            visitDate={`${selectedMedicalRecord.visitDate} ${selectedMedicalRecord.visitTime}`}
            hospitalId={selectedMedicalRecord.id}
          />
        )}
        {/* 👇 10. '병원 리뷰' 페이지 추가 */}
        {currentPage === "hospital-reviews" && selectedHospital && (
          <HospitalReviewsPage
            onBack={() => setCurrentPage("hospital-detail")}
            hospitalName={selectedHospital.name}
            reviews={[
              // 샘플 리뷰 먼저
              ...sampleReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: review.id,
                  author: review.userName,
                  date: review.visitDate,
                  visitType: review.visitType || "첫방문",
                  rating: review.rating,
                  likes: review.likes || 0,
                  tags: review.keywords,
                  content: review.reviewText,
                })),
              // 사용자가 작성한 리뷰 추가
              ...myReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: review.id,
                  author: review.userName,
                  date: new Date(review.createdAt).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  }).replace(/\. /g, '.').replace(/\.$/, ''),
                  visitType: review.visitType || "재방문",
                  rating: review.rating,
                  likes: review.likes || 0,
                  tags: review.keywords,
                  content: review.reviewText,
                }))
            ]}
          />
        )}
      </div>
      {/* 👇 Toaster 추가 - 화면 하단에 토스트 메시지 표시 */}
      <Toaster position="bottom-center" />
    </div>
  );
}
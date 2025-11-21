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
  // 사용자 프로필 이미지 관리 (없으면 기본 이미지)
  const [userAvatar, setUserAvatar] = useState("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  
  // 알림 페이지에서 돌아갈 페이지 추적
  const [previousPage, setPreviousPage] = useState<Page>("home");
  
  // 찜한 병원 목록 관리
  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>([]);
  
  // 리뷰 작성한 병원 ID 목록 관리
  const [reviewedHospitals, setReviewedHospitals] = useState<number[]>([]);
  
  // 작성한 리뷰 목록 관리 (초기 목데이터 포함)
  const [myReviews, setMyReviews] = useState<Review[]>([
    {
      id: 1,
      hospitalId: 1,
      hospitalName: "바른정형외과의원",
      hospitalImage: "https://example.com/hospital1.jpg",
      visitDate: "2025.08.05",
      rating: 5,
      keywords: [
        "회복이 빨라요",
        "친절해요",
        "과잉진료가 없어요",
      ],
      reviewText:
        "대기 많아서 대리접수 해드렸어요. 꾸준히 물리 받고 많이 좋아지셨습니다 첨엔 가만히 있어도 통증이 심했는데 3개월 정도 다녔는데 이제 통증도 없으시다고 하네요. 앞으로도 잘부탁드립니다",
      userName: "김철수",
      userAvatar: "https://example.com/avatar1.jpg",
      createdAt: "2024-11-15T10:00:00Z",
      visitType: "첫방문",
    },
    {
      id: 2,
      hospitalId: 2,
      hospitalName: "고운피부과",
      hospitalImage: "https://example.com/hospital2.jpg",
      visitDate: "2025.07.14",
      rating: 5,
      keywords: ["쾌적해요", "꼼꼼해요"],
      reviewText:
        "토닝이랑 재생관리 받으려고 방문했어요. 장비도 최신 모델링이고, 시술 과정도 꼼꼼해서 믿음이 갑니다.",
      userName: "이영희",
      userAvatar: "https://example.com/avatar2.jpg",
      createdAt: "2024-11-10T14:00:00Z",
      visitType: "첫방문",
    },
    {
      id: 3,
      hospitalId: 3,
      hospitalName: "오늘도강한내과의원",
      hospitalImage: "https://example.com/hospital3.jpg",
      visitDate: "2025.07.02",
      rating: 5,
      keywords: ["꼼꼼해요", "과잉진료가 없어요"],
      reviewText:
        "아빠 혈압약 받아왔습니다. 원장님 언제나 친절하고 좋으세요!",
      userName: "박민수",
      userAvatar: "https://example.com/avatar3.jpg",
      createdAt: "2024-10-25T12:00:00Z",
      visitType: "재방문",
    },
  ]);

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
      userName: "관리자", // 👈 현재 로그인된 사용자와 일치시킴
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
      id: Math.max(0, ...posts.map(p => p.id)) + 1,
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

  // 리뷰 삭제 함수
  const handleDeleteReview = (reviewId: number) => {
    setMyReviews(myReviews.filter(review => review.id !== reviewId));
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
            currentUserAvatar={userAvatar} // 👈 현재 로그인된 사용자 프로필 이미지 전달
          />
        )}
        {/* 👇 3. '준비중' 텍스트 대신 ProfilePage 컴포넌트로 교체 */}
        {currentPage === "profile" && (
          <ProfilePage
            userName={userName}
            userAvatar={userAvatar} // 👈 프로필 이미지 전달
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onBack={() => setCurrentPage("home")} // '뒤로가기' 누르면 홈으로
            onMyReviewsClick={() => setCurrentPage("my-reviews")}
            onFavoriteHospitalsClick={() => setCurrentPage("favorite-hospitals")}
            myReviewsCount={myReviews.length} // 👈 리뷰 개수 전달
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
            onDeleteReview={handleDeleteReview}
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
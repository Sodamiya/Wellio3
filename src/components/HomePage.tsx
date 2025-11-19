import { Header } from "./Header";
import { UserGreeting } from "./UserGreeting";
import { CalendarCard } from "./CalendarCard";
import { PromoBanner } from "./PromoBanner";
import { CTAButtons } from "./CTAButtons";
import { BottomNav } from "./BottomNav";
import { SecondaryMenu } from "./SecondaryMenu";
import { HealthKnowledge } from "./HealthKnowledge";

interface HomePageProps {
  userName: string;
  currentPage: string;
  onPageChange: (
    page: "home" | "community" | "hospital" | "profile" | "medical-history",
  ) => void;
}

export function HomePage({
  userName,
  currentPage,
  onPageChange,
}: HomePageProps) {
  return (
    <>
      <Header onNotificationClick={() => onPageChange("notifications" as any)} />

      {/* [수정] pt-4 제거: UserGreeting의 배경 SVG가 
        화면 상단(헤더 뒤)까지 꽉 차도록 
      */}
      <main className="bg-[#F7F7F7] pb-24">
        <UserGreeting userName={userName} />

        <div className="relative -mt-20 z-10">
          {" "}
          <CalendarCard />
        </div>

        <div className="px-4 sm:px-6 md:px-8 mt-6">
          <PromoBanner />
        </div>

        <div className="px-4 sm:px-6 md:px-8 mt-6">
          <CTAButtons
            onHospitalClick={() => onPageChange("hospital")}
          />
        </div>

        <div className="px-4 sm:px-6 md:px-8 mt-3">
          {" "}
          <SecondaryMenu />
        </div>

        <div className="mt-8">
          {" "}
          <HealthKnowledge />
        </div>
      </main>

      <BottomNav
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </>
  );
}
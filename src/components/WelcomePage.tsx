import image_b41bc2e4319a3db074275b4da6314c6ddf33f5db from 'figma:asset/b41bc2e4319a3db074275b4da6314c6ddf33f5db.png';
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WelcomePageProps {
  onGuestMode: () => void;
  onSignUp: () => void;
}

export function WelcomePage({ onGuestMode, onSignUp }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-5 py-10 max-w-[500px] mx-auto">
      {/* 타이틀 */}
      <div className="w-full max-w-[320px] text-left mt-2">
        <h1 className="text-[25px] leading-[1.4] whitespace-pre-line text-[#1a1a1a]">
          {`웰리오와 함께\n우리가족\n건강관리 시작하세요.`}
        </h1>
      </div>

      {/* 이미지 - 수정된 부분 */}
      <div className="flex-1 flex items-center justify-center w-full my-10">
        <ImageWithFallback
          src={image_b41bc2e4319a3db074275b4da6314c6ddf33f5db}
          alt="doctor illustration"
          // w-full: 가로 꽉 채움, h-auto: 높이 자동 비율
          className="w-full h-auto object-cover"
        />
      </div>

      {/* 버튼 그룹 */}
      <div className="w-full max-w-[330px] space-y-3">
        <button
          onClick={onGuestMode}
          className="w-full px-4 py-[15px] rounded-xl bg-[#21d2c4] text-white font-semibold hover:bg-[#1bc0b2] transition-colors"
        >
          관리자 계정으로 둘러보기
        </button>
        <button
          onClick={onSignUp}
          className="w-full px-4 py-[15px] rounded-xl bg-white text-[#21d2c4] border-2 border-[#21d2c4] font-semibold hover:bg-[#f0fffe] transition-colors"
        >
          다른 방법으로 시작하기
        </button>
      </div>
    </div>
  );
}
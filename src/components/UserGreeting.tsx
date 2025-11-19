interface UserGreetingProps {
  userName: string;
}

function BackgroundSvg() {
  return (
    <svg
      width="100%"
      viewBox="0 0 375 218"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-full z-0"
      preserveAspectRatio="xMidYMax meet"
    >
      <g clipPath="url(#clip0_8255_7621)">
        <path
          d="M375.572 137.476C375.572 137.476 332.611 124.115 303.519 120.221C264.785 115.036 241.456 125.497 202.744 120.221C140.503 111.739 74.5045 46.2622 11.2735 48.0354C3.26205 48.26 -1.10242 48.3399 -3.33878 48.3449V48.0357C-3.33878 48.0357 -8.03894 48.3555 -3.33878 48.3449V217H375.572V137.476Z"
          fill="url(#paint0_linear_8255_7621)"
        />
      </g>
      <g clipPath="url(#clip1_8255_7621)">
        <path
          d="M71.5723 87.5633C42.7036 92.7542 0.0722656 110.563 0.0722656 110.563V216.563H376.072V28.5633C376.072 28.5633 339.231 14.9921 314.572 14.0633C251.827 11.6997 233.336 76.257 171.572 87.5633C133.158 94.5953 110.008 80.6521 71.5723 87.5633Z"
          fill="url(#paint1_linear_8255_7621)"
          fillOpacity="0.59"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_8255_7621"
          x1="185.072"
          y1="48"
          x2="185.072"
          y2="217"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D7EAFF" />
          <stop offset="0.245192" stopColor="#B9E6FA" />
          <stop offset="0.990385" stopColor="#B9E6FA" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_8255_7621"
          x1="188.072"
          y1="14"
          x2="188.072"
          y2="216.563"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.105769" stopColor="#36D9D9" />
          <stop offset="0.375" stopColor="#6BDBD8" />
          <stop
            offset="1"
            stopColor="white"
            stopOpacity="0.37"
          />
        </linearGradient>
        <clipPath id="clip0_8255_7621">
          <rect width="376" height="218" fill="white" />
        </clipPath>
        <clipPath id="clip1_8255_7621">
          <rect width="376" height="218" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function UserGreeting({ userName }: UserGreetingProps) {
  return (
    <div className="relative w-full h-[250px] md:h-[420px] overflow-hidden">
      {/* 1. SVG 배경 */}
      <BackgroundSvg />

      {/* 2. 텍스트 */}
      {/* [수정] 텍스트 패딩을 pt-12 (48px) -> pt-20 (80px)로 수정
        (헤더 높이 h-16 (64px) 보다 크게)
      */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 pt-20 md:pt-24 space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
          {userName}님
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
          이번주는 혈압이 안정적이예요!
        </p>
      </div>
    </div>
  );
}
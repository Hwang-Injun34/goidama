import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 배경색 및 기본 화이트톤
        background: "#FFFFFF",
        surface: "#FAFAFA",
        
        // 라벤더 브랜드 팔레트
        brand: {
          50: "#F3EFFC",   // 아주 연한 배경 (슬라이드, 강조 박스)
          100: "#EDE8F5",  // 테두리, 구분선, 연한 아이콘 배경
          400: "#C4B5FD",  // 중간 포인트, 스토리 링, 비활성 배지
          600: "#8B7FD4",  // 메인 시그니처 컬러 (텍스트, 버튼, 포인트)
          800: "#4A3F8A",  // 깊은 강조색 (버튼 클릭 시, 진한 강조 문구)
        },

        // 느끼하지 않은 깔끔한 무채색 (검정 대신 진한 회색 사용)
        gray: {
          primary: "#1A1A1A", // 제목, 주요 텍스트
          muted: "#8E8E93",   // 부가 설명, 날짜
          light: "#DBDBDB",   // 비활성 버튼, 화살표 아이콘
          50: "#F9F9F9",      // 아주 미세한 배경 구분
        },

        // 이벤트나 가이드에서 쓰일 보조 색상
        point: {
          pink: "#F472B6",
          pinkBg: "#FDF2F8",
          sky: "#0EA5E9",
          skyBg: "#F0F9FF",
        }
      },
      fontFamily: {
        // 기존 폰트 설정 유지
        pretendard: ["var(--font-pretendard-rounded)", "Pretendard", "sans-serif"],
      },
      borderRadius: {
        '2xl': '18px', // 대시보드 캡슐 카드용
        '3xl': '24px', // 히어로 슬라이드용
        '4xl': '32px', // 아주 둥근 버튼이나 캡슐용
      },
      keyframes: {
        // 타임캡슐의 신비로운 느낌을 주는 둥둥 뜨는 애니메이션 유지/보정
        lgFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        lgUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'lg-float': 'lgFloat 5s ease-in-out infinite',
        'lg-float-slow': 'lgFloat 8s ease-in-out infinite reverse',
        'lg-up': 'lgUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      boxShadow: {
        // 라벤더 톤에 맞춘 아주 연한 그림자 (흰 배경에서 입체감 부여)
        'soft': '0 4px 20px rgba(139, 127, 212, 0.05)', 
        'card': '0 8px 30px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
};

export default config;
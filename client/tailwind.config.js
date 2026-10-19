/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        sky: "#38BDF8",
        orange: "#FF7A3D",
        gold: "#F5B83D",
        cloud: "#F8FAFC",
        teal: "#14B8A6",
      },
      fontFamily: {
        display: ["Outfit", "Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        marquee: "marquee 30s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(255,122,61,0.4)" },
          "50%": { boxShadow: "0 0 0 14px rgba(255,122,61,0)" },
        },
      },
    },
  },
  plugins: [],
};

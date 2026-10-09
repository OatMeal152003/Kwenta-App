import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",
        accent: "#F5B83D",
        accentdark: "#FFC857",
        bg: "#F7FAF9",
        bgdark: "#0B1220",
        carddark: "#151E32",
        ink: "#1E293B",
        inkdark: "#E6EDF7",
        income: "#22C55E",
        incometext: "#15803D",
        expense: "#F26B5B",
        expensetext: "#B93A2B",
      },
      borderRadius: {
        xl2: "16px",
        xl3: "24px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

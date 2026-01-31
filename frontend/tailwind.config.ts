import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        background: {
          primary: "#FDF8F6",
          secondary: "#FAF5F2",
          card: "#FFFFFF",
        },
        foreground: {
          primary: "#2D2A26",
          secondary: "#6B6560",
        },
        accent: {
          primary: "#9D6B9D",
          secondary: "#6B9D9D",
          male: "#5B8FB9",
          female: "#B97B8B",
        },
        success: "#7DA87D",
        warning: "#D4A574",
        error: "#C97B7B",
      },
      fontFamily: {
        sans: ["Heebo", "Rubik", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};

export default config;

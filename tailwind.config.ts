import type { Config } from "tailwindcss";

export default {
  // Remove darkMode config entirely to disable it
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Force light mode colors
        background: "#ffffff",
        foreground: "#000000",
      },
    },
  },
  plugins: [],
} satisfies Config;
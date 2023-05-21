import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "neo": "3px 3px 0px #000"
      },
    },
  },
  plugins: [],
} satisfies Config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d9aa5",
          light: "#3fb7c2",
          dark: "#15737b"
        },
        accent: {
          DEFAULT: "#f29f58",
          soft: "#fde3c5"
        }
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
};


/** @type {import('tailwindcss').Config} */
module.exports = {
 content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
 theme: {
  extend: {
   colors: {
    accent: "#5576EB",
   },
  },
 },
 plugins: [require("@tailwindcss/typography")],
};

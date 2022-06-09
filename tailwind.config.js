module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    // colors: {
    //   transparent: 'transparent',
    //   current: 'currentColor',
    // },
    extend: {
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

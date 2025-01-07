import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // Set 'src/' as the project root
  build: {
    outDir: "../dist", // Output built files to 'dist/' outside 'src/'
    copyPublicDir: true,
  },
  server: {
    https: true,
    port: 4000,
  },
  publicDir: "public",
});

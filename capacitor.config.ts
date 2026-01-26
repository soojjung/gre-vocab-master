import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.suya.grevocab",
  appName: "단어의 신 GRE",
  webDir: "dist",
  ios: {
    contentInset: "never",
    preferredContentMode: "mobile",
    scheme: "GRE Vocab",
  },
  server: {
    // 프로덕션에서는 로컬 파일 사용
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    },
  },
};

export default config;

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.swulifetracker.app",
  appName: "SWU Life Tracker",
  webDir: "pwa",
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;

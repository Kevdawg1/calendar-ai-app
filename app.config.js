export default {
  expo: {
    name: "AI-Cal",
    slug: "ai-cal",
    version: "3.0.0",
    orientation: "default",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kevinkam.aical",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.kevinkam.aical"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-notifications"
    ],
    extra: {
      "eas": {
        "projectId": "1012516f-4c12-4b13-aa4e-69529c933e64"
      },
      azureOpenaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
      azureOpenaiApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenaiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT
    },
    owner: "kevin.kam"
  }
}; 
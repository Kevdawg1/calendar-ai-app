export default {
  expo: {
    name: "AI-Cal",
    slug: "ai-cal",
    version: "1.0.0",
    orientation: "portrait",
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
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.kevinkam.aical"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
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
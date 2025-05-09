import 'dotenv/config';

export default {
  "owner": "jmitchell91902",
  expo: {
	"owner": "jmitchell91902",
    name: "TasKing",
    slug: "TasKing",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./app/assets/imgs/logo_small.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./app/assets/imgs/logo_small.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anonymous.TasKing"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./app/assets/imgs/logo_small.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./app/assets/imgs/logo_large.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
	  eas: {
        projectId: "4647e131-2a00-4999-b70b-6a1cda4aa718"
      },
      router: {
        origin: false
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY
    },
  }
};

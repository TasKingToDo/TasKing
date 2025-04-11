// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps} from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
//import { getReactNativePersistence } from "firebase/auth";
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_HERE",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  databaseURL: "FIRESTORE_DATABASE_URL",
  projectId: "tasking-c1d66",
  storageBucket: "tasking-c1d66.firebasestorage.app",
  messagingSenderId: "MESSAGE_SENDER_ID",
  appId: "APP_ID_HERE",
  measurementId: "G-551LE4Y0X2"
};

// Initialize Firebase
const FIREBASE_APP = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {persistence: getReactNativePersistence(ReactNativeAsyncStorage)})

const FIREBASE_DB = getFirestore(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB, getApp, getAuth };

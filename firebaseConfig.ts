// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps} from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
//import { getReactNativePersistence } from "firebase/auth";
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "tasking-c1d66.firebaseapp.com",
  databaseURL: "https://tasking-c1d66-default-rtdb.firebaseio.com/",
  projectId: "tasking-c1d66",
  storageBucket: "tasking-c1d66.firebasestorage.app",
  messagingSenderId: "763110473309",
  appId: "1:763110473309:web:23c29e78c6d074e0d117b4",
  measurementId: "G-551LE4Y0X2"
};

// Initialize Firebase
const FIREBASE_APP = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {persistence: getReactNativePersistence(ReactNativeAsyncStorage)})

const FIREBASE_DB = getFirestore(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB, getApp, getAuth };

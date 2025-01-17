// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBH090ngRUtlLZCag4r8HY28-KXnzcmbjI",
  authDomain: "tasking-c1d66.firebaseapp.com",
  databaseURL: "https://tasking-c1d66-default-rtdb.firebaseio.com",
  projectId: "tasking-c1d66",
  storageBucket: "tasking-c1d66.firebasestorage.app",
  messagingSenderId: "763110473309",
  appId: "1:763110473309:web:23c29e78c6d074e0d117b4",
  measurementId: "G-551LE4Y0X2"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
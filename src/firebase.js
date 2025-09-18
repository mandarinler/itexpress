// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl3ab2tHsO-huzHJtO1z8doma90K_HftE",
  authDomain: "itexpress-28412.firebaseapp.com",
  projectId: "itexpress-28412",
  storageBucket: "itexpress-28412.firebasestorage.app",
  messagingSenderId: "459923608644",
  appId: "1:459923608644:web:e0e44ef30ec0d1974b9811",
  measurementId: "G-BBVYFWZTQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
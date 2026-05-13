// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHSYnCmIUT-vdMzdQjkn7ZBKHNRmMjLc0",
  authDomain: "vet-flow-app-joysdq.firebaseapp.com",
  projectId: "vet-flow-app-joysdq",
  storageBucket: "vet-flow-app-joysdq.firebasestorage.app",
  messagingSenderId: "337182926753",
  appId: "1:337182926753:web:9b9a27f16f635864e68de0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

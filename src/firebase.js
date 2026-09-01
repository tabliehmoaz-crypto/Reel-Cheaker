/*
  REELIQ — FIREBASE
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1uxDKytydzR_XBrK15L8winPeYqb1uSo",
  authDomain: "reeliq-5360c.firebaseapp.com",
  projectId: "reeliq-5360c",
  storageBucket: "reeliq-5360c.firebasestorage.app",
  messagingSenderId: "1033116621079",
  appId: "1:1033116621079:web:d07e824a8497f4d7197f52"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

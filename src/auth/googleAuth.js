/*
  REELIQ — GOOGLE AUTH
*/

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "../firebase.js";

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);

    return {
      success: false,
      error: error?.message || "Google sign-in failed."
    };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Google Logout Error:", error);
    return false;
  }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback(null);
      return;
    }

    callback({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    });
  });
}

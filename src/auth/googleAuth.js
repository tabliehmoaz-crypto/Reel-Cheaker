/*
  MTI — GOOGLE AUTH
  -----------------
  Firebase Authentication using Google.
  Redirect flow is used because it is reliable on iOS/Safari as well as desktop/mobile.
*/

import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "../firebase.js";
import { memoryService } from "../core/MTIMemoryService.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    id: user.uid,
    provider: "google",
    email: user.email || "",
    name: user.displayName || "",
    photoURL: user.photoURL || ""
  };
}

function initializeUserMemory(user) {
  const account = mapFirebaseUser(user);
  if (!account) return null;
  memoryService.setAccount(account);
  return account;
}

export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
    return { success: true, redirecting: true };
  } catch (error) {
    console.error("MTI Google Sign-In Error:", error);
    return {
      success: false,
      error: error?.message || "Google sign-in failed."
    };
  }
}

export async function resolveGoogleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ? initializeUserMemory(result.user) : null;
  } catch (error) {
    console.error("MTI Google Redirect Error:", error);
    return {
      error: error?.message || "Google sign-in could not be completed."
    };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    memoryService.clearAccount?.();
    return true;
  } catch (error) {
    console.error("MTI Logout Error:", error);
    return false;
  }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? initializeUserMemory(user) : null);
  });
}

export function getCurrentUser() {
  return mapFirebaseUser(auth.currentUser);
}

/*
  MTI — GOOGLE AUTH
  -----------------
  Firebase Authentication using Google.

  Strategy: popup-first, with automatic redirect fallback.

  signInWithRedirect requires a full-page navigation away from the
  app and back again; the pending sign-in state is handed off via
  sessionStorage/IndexedDB across that navigation. In sandboxed
  previews, embedded iframes, or browsers with partitioned/blocked
  third-party storage, that handoff can silently fail: Google's
  account picker still opens and the user can still pick an
  account, but the app never receives the result and never shows
  as signed in — with no visible error.

  signInWithPopup keeps everything inside the same page/session, so
  it does not depend on that cross-navigation handoff and is far
  more reliable in those environments. We try popup first and only
  fall back to redirect for the specific cases where popups
  genuinely cannot work (blocked by the browser, or unsupported in
  the current environment/webview).
*/

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "../firebase.js";
import { memoryService } from "../core/MTIMemoryService.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Error codes where a popup genuinely cannot be used and falling
// back to a full redirect is the right move.
const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment"
]);

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
  try {
    memoryService.setAccount(account);
  } catch (error) {
    // Never let a memory/storage failure hide a successful sign-in
    // from the UI — the user is still authenticated either way.
    console.error("MTI Memory Init Error (sign-in still succeeded):", error);
  }
  return account;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: mapFirebaseUser(result.user) };
  } catch (error) {
    console.error("MTI Google Sign-In (popup) Error:", error?.code, error?.message);

    if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
      return { success: false, cancelled: true };
    }

    if (REDIRECT_FALLBACK_CODES.has(error?.code)) {
      try {
        await signInWithRedirect(auth, provider);
        return { success: true, redirecting: true };
      } catch (redirectError) {
        console.error("MTI Google Sign-In (redirect fallback) Error:", redirectError?.code, redirectError?.message);
        return { success: false, error: redirectError?.message || "Google sign-in failed." };
      }
    }

    return {
      success: false,
      error: (error?.code ? `[${error.code}] ` : "") + (error?.message || "Google sign-in failed.")
    };
  }
}

export async function resolveGoogleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ? initializeUserMemory(result.user) : null;
  } catch (error) {
    console.error("MTI Google Redirect Error:", error?.code, error?.message);
    return {
      error: (error?.code ? `[${error.code}] ` : "") + (error?.message || "Google sign-in could not be completed.")
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

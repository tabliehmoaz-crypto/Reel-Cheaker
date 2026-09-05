/*
  MTI — GOOGLE AUTH
  -----------------
  Firebase Authentication using Google.

  Stable flow:
  - Popup first.
  - Explicit LOCAL persistence.
  - Auth state is confirmed through Firebase.
  - Redirect is used only when the browser genuinely blocks popup.
*/

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "../firebase.js";
import { memoryService } from "../core/MTIMemoryService.js";


/* ---------------------------------------
   GOOGLE PROVIDER
--------------------------------------- */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

provider.addScope("profile");
provider.addScope("email");


/* ---------------------------------------
   FIREBASE USER → MTI ACCOUNT
--------------------------------------- */

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


/* ---------------------------------------
   INITIALIZE MTI MEMORY
--------------------------------------- */

function initializeUserMemory(user) {
  const account = mapFirebaseUser(user);

  if (!account) return null;

  try {
    memoryService.setAccount(account);
  } catch (error) {
    /*
      Memory failure must never prevent
      successful Google authentication.
    */
    console.error(
      "MTI Memory Init Error:",
      error
    );
  }

  return account;
}


/* ---------------------------------------
   PERSISTENCE
--------------------------------------- */

let persistenceReady = null;

function ensurePersistence() {
  if (!persistenceReady) {
    persistenceReady = setPersistence(
      auth,
      browserLocalPersistence
    ).catch((error) => {
      console.warn(
        "MTI Auth Persistence Warning:",
        error?.code,
        error?.message
      );

      /*
        Authentication can still continue even
        if persistence cannot be established.
      */

      return false;
    });
  }

  return persistenceReady;
}


/* ---------------------------------------
   GOOGLE SIGN-IN
--------------------------------------- */

export async function signInWithGoogle() {
  try {
    /*
      Make sure Firebase persistence is configured
      BEFORE opening Google's authentication flow.
    */
    await ensurePersistence();

    /*
      Primary method:
      signInWithPopup keeps the authentication
      inside the current browser session.
    */
    const result = await signInWithPopup(
      auth,
      provider
    );

    if (!result?.user) {
      return {
        success: false,
        error: "Google returned no authenticated user."
      };
    }

    const account = initializeUserMemory(
      result.user
    );

    return {
      success: true,
      user: account
    };

  } catch (error) {

    console.error(
      "MTI Google Sign-In Error:",
      error?.code,
      error?.message
    );


    /* ---------------------------------------
       USER CANCELLED
    --------------------------------------- */

    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      return {
        success: false,
        cancelled: true
      };
    }


    /* ---------------------------------------
       POPUP BLOCKED / UNSUPPORTED
       → FALL BACK TO REDIRECT
    --------------------------------------- */

    const redirectCodes = new Set([
      "auth/popup-blocked",
      "auth/operation-not-supported-in-this-environment"
    ]);

    if (redirectCodes.has(error?.code)) {

      try {

        await ensurePersistence();

        await signInWithRedirect(
          auth,
          provider
        );

        /*
          The browser will leave the page here.
          getRedirectResult() will resolve the
          authentication after the app returns.
        */

        return {
          success: true,
          redirecting: true
        };

      } catch (redirectError) {

        console.error(
          "MTI Google Redirect Error:",
          redirectError?.code,
          redirectError?.message
        );

        return {
          success: false,
          error:
            (redirectError?.code
              ? `[${redirectError.code}] `
              : "") +
            (
              redirectError?.message ||
              "Google sign-in could not be completed."
            )
        };
      }
    }


    /* ---------------------------------------
       NORMAL FIREBASE ERROR
    --------------------------------------- */

    return {
      success: false,
      error:
        (error?.code
          ? `[${error.code}] `
          : "") +
        (
          error?.message ||
          "Google sign-in failed."
        )
    };
  }
}


/* ---------------------------------------
   REDIRECT RESULT
--------------------------------------- */

export async function resolveGoogleRedirect() {
  try {

    await ensurePersistence();

    const result = await getRedirectResult(auth);

    if (!result?.user) {
      return null;
    }

    return initializeUserMemory(
      result.user
    );

  } catch (error) {

    console.error(
      "MTI Google Redirect Error:",
      error?.code,
      error?.message
    );

    return {
      error:
        (error?.code
          ? `[${error.code}] `
          : "") +
        (
          error?.message ||
          "Google sign-in could not be completed."
        )
    };
  }
}


/* ---------------------------------------
   LOGOUT
--------------------------------------- */

export async function logout() {
  try {

    await signOut(auth);

    try {
      memoryService.clearAccount?.();
    } catch (memoryError) {
      console.warn(
        "MTI Memory Clear Warning:",
        memoryError
      );
    }

    return true;

  } catch (error) {

    console.error(
      "MTI Logout Error:",
      error
    );

    return false;
  }
}


/* ---------------------------------------
   AUTH STATE OBSERVER
--------------------------------------- */

export function observeAuth(callback) {

  return onAuthStateChanged(
    auth,
    (user) => {

      if (user) {
        callback(
          initializeUserMemory(user)
        );
      } else {
        callback(null);
      }
    }
  );
}


/* ---------------------------------------
   CURRENT USER
--------------------------------------- */

export function getCurrentUser() {
  return mapFirebaseUser(
    auth.currentUser
  );
}

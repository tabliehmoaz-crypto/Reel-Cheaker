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
/*
  Auth must stay independent from MTI Memory/Core bootstrap.
  If Memory has a module error, Google login must still initialize.
*/
let memoryServicePromise = null;
async function getMemoryService() {
  if (!memoryServicePromise) {
    memoryServicePromise = import("../core/MTIMemoryService.js")
      .then(module => module.memoryService || null)
      .catch(error => {
        console.warn("MTI Memory lazy-load warning:", error);
        return null;
      });
  }
  return memoryServicePromise;
}


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

async function initializeUserMemory(user) {
  const account = mapFirebaseUser(user);
  if (!account) return null;

  try {
    const service = await getMemoryService();
    service?.setAccount(account);
  } catch (error) {
    console.error("MTI Memory Init Error:", error);
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
    await ensurePersistence();

    /*
      iOS/Safari is much more reliable with Firebase redirect auth
      than popup auth. A popup can show the Google account picker,
      then close before Firebase completes the opener handshake.
      Use redirect first on mobile Safari.
    */
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    if (isIOS || isAndroid) {
      await signInWithRedirect(auth, provider);
      return {
        success: true,
        redirecting: true
      };
    }

    const result = await signInWithPopup(auth, provider);

    if (!result?.user) {
      return {
        success: false,
        error: "Google returned no authenticated user."
      };
    }

    const account = await initializeUserMemory(result.user);

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

    /*
      Some mobile/browser configurations still attempt popup auth
      through a wrapper. If the popup closes before Firebase can
      complete, immediately retry through the redirect flow.
    */
    const redirectCodes = new Set([
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/operation-not-supported-in-this-environment",
      "auth/cancelled-popup-request"
    ]);

    if (redirectCodes.has(error?.code)) {
      try {
        await ensurePersistence();
        await signInWithRedirect(auth, provider);

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
      getMemoryService().then((memoryService) => {
        try { memoryService?.clearAccount?.(); } catch (memoryError) {
          console.warn("MTI Memory Clear Warning:", memoryError);
        }
      });
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
      if (!user) {
        callback(null);
        return;
      }

      initializeUserMemory(user)
        .then((account) => callback(account))
        .catch((error) => {
          console.error("MTI Auth/Memory bootstrap error:", error);
          callback(mapFirebaseUser(user));
        });
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


/* ---------------------------------------
   HIGH-LEVEL INIT
   (used directly by index.html)
--------------------------------------- */

/*
  initGoogleAuth(options)

  - يربط زر تسجيل الدخول (id="googleLoginBtn") بـ signInWithGoogle
  - يراقب حالة الدخول عبر observeAuth ويستدعي onLogin/onLogout
  - يحل نتيجة أي تحويل (redirect) سابق تلقائياً

  options:
    onLogin(user)   -> يُستدعى عند دخول ناجح أو استعادة جلسة سابقة
    onLogout()      -> يُستدعى عند الخروج أو عدم وجود جلسة
    loginButtonId   -> افتراضياً "googleLoginBtn"
*/
export function initGoogleAuth(options = {}) {

  const {
    onLogin = () => {},
    onLogout = () => {},
    loginButtonId = "googleLoginBtn"
  } = options;

  const button = document.getElementById(loginButtonId);

  if (button && !button.dataset.mtiAuthBound) {

    button.dataset.mtiAuthBound = "true";

    button.addEventListener("click", async () => {

      button.disabled = true;

      const result = await signInWithGoogle();

      button.disabled = false;

      if (result?.success && result.user) {
        onLogin(result.user);
      } else if (result?.error) {
        console.error("MTI Google Sign-In Error:", result.error);
        alert("تعذّر تسجيل الدخول: " + result.error);
      }
      // result.cancelled أو result.redirecting: لا حاجة لأي إجراء إضافي
    });

  }

  // استعادة نتيجة تحويل (redirect) إن وُجدت
  resolveGoogleRedirect().then((account) => {
    if (account && !account.error) {
      onLogin(account);
    }
  });

  // مراقبة مستمرة لحالة تسجيل الدخول (تشمل الجلسات المحفوظة سابقاً)
  const unsubscribe = observeAuth((user) => {
    if (user) {
      onLogin(user);
    } else {
      onLogout();
    }
  });

  return { unsubscribe };
}

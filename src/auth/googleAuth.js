/*
  MTI — GOOGLE AUTH
  -----------------

  Google authentication + account-scoped memory.

  مسؤول عن:
  - تسجيل الدخول عبر Google
  - تحويل Firebase User إلى MTI Account
  - ربط الحساب بذاكرته الخاصة
  - مراقبة حالة تسجيل الدخول
  - تسجيل الخروج
*/


import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "../firebase.js";

import { memoryService } from "../core/MTIMemoryService.js";



/* =========================================================
   GOOGLE PROVIDER
========================================================= */


const provider =
  new GoogleAuthProvider();


provider.setCustomParameters({
  prompt: "select_account"
});



/* =========================================================
   FIREBASE USER → MTI ACCOUNT
========================================================= */


function mapFirebaseUser(
  user
) {

  if (!user) {
    return null;
  }


  return {

    id:
      user.uid,

    provider:
      "google",

    email:
      user.email || "",

    name:
      user.displayName || "",

    photoURL:
      user.photoURL || ""

  };

}



/* =========================================================
   INITIALIZE ACCOUNT MEMORY
========================================================= */


function initializeUserMemory(
  user
) {

  const account =
    mapFirebaseUser(
      user
    );


  if (!account) {
    return null;
  }


  memoryService.setAccount(
    account
  );


  return account;

}



/* =========================================================
   SIGN IN
========================================================= */


export async function signInWithGoogle() {

  try {

    const result =
      await signInWithPopup(
        auth,
        provider
      );


    const user =
      result.user;


    const account =
      initializeUserMemory(
        user
      );


    return {

      success:
        true,

      user:
        account

    };

  } catch (error) {

    console.error(
      "Google Sign-In Error:",
      error
    );


    return {

      success:
        false,

      error:
        error?.message ||
        "Google sign-in failed."

    };

  }

}



/* =========================================================
   LOGOUT
========================================================= */


export async function logout() {

  try {

    await signOut(
      auth
    );


    return true;

  } catch (error) {

    console.error(
      "Google Logout Error:",
      error
    );


    return false;

  }

}



/* =========================================================
   AUTH OBSERVER
========================================================= */


export function observeAuth(
  callback
) {

  return onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {

        callback(
          null
        );

        return;

      }


      const account =
        initializeUserMemory(
          user
        );


      callback(
        account
      );

    }
  );

}



/* =========================================================
   AUTH INFO
========================================================= */


export function getCurrentUser() {

  const user =
    auth.currentUser;


  return mapFirebaseUser(
    user
  );

}

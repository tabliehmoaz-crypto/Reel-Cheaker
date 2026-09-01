/*
  REELIQ — GOOGLE AUTH
  --------------------------------
  تسجيل الدخول بحساب Google.

  Local-first:
  - لا يحذف Account Memory.
  - يحفظ بيانات الحساب محلياً.
  - جاهز لاحقاً لإضافة Cloud Sync.
*/


import {
  initializeAccount
} from "../memory/AccountMemory.js";


const GOOGLE_CLIENT_ID =
  import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
  "";


const GOOGLE_SCRIPT_URL =
  "https://accounts.google.com/gsi/client";


/* =====================================================
   LOAD GOOGLE SCRIPT
===================================================== */

function loadGoogleScript() {

  return new Promise(
    (resolve, reject) => {

      if (
        typeof window === "undefined"
      ) {

        reject(
          new Error(
            "Google Auth requires a browser."
          )
        );

        return;

      }


      if (
        window.google?.accounts?.id
      ) {

        resolve();

        return;

      }


      const existing =
        document.querySelector(
          `script[src="${GOOGLE_SCRIPT_URL}"]`
        );


      if (existing) {

        existing.addEventListener(
          "load",
          resolve
        );

        existing.addEventListener(
          "error",
          reject
        );

        return;

      }


      const script =
        document.createElement(
          "script"
        );


      script.src =
        GOOGLE_SCRIPT_URL;

      script.async =
        true;

      script.defer =
        true;


      script.onload =
        resolve;

      script.onerror =
        () =>
          reject(
            new Error(
              "Unable to load Google Identity Services."
            )
          );


      document.head.appendChild(
        script
      );

    }
  );

}


/* =====================================================
   INITIALIZE GOOGLE AUTH
===================================================== */

export async function initializeGoogleAuth(
  onCredential
) {

  if (
    !GOOGLE_CLIENT_ID
  ) {

    throw new Error(
      "Google Client ID is missing. Add VITE_GOOGLE_CLIENT_ID."
    );

  }


  await loadGoogleScript();


  window.google.accounts.id.initialize({

    client_id:
      GOOGLE_CLIENT_ID,

    callback:
      response => {

        const account =
          decodeGoogleCredential(
            response.credential
          );


        if (
          account
        ) {

          initializeAccount({

            id:
              account.id,

            provider:
              "google",

            email:
              account.email,

            name:
              account.name,

            photoURL:
              account.photoURL

          });


          if (
            typeof onCredential ===
            "function"
          ) {

            onCredential(
              account
            );

          }

        }

      }

  });


  return true;

}


/* =====================================================
   RENDER GOOGLE BUTTON
===================================================== */

export async function renderGoogleButton(
  element,
  onCredential
) {

  if (
    !element
  ) {

    throw new Error(
      "Google button element is required."
    );

  }


  await initializeGoogleAuth(
    onCredential
  );


  window.google.accounts.id.renderButton(
    element,
    {

      theme:
        "outline",

      size:
        "large",

      shape:
        "rectangular",

      text:
        "signin_with",

      width:
        300

    }
  );

}


/* =====================================================
   SIGN OUT
===================================================== */

export function signOutGoogle() {

  if (
    typeof window === "undefined"
  ) {

    return;

  }


  if (
    window.google?.accounts?.id
  ) {

    window.google.accounts.id.disableAutoSelect();

  }

}


/* =====================================================
   DECODE GOOGLE CREDENTIAL
===================================================== */

function decodeGoogleCredential(
  credential
) {

  try {

    const parts =
      credential.split(".");

    if (
      parts.length !== 3
    ) {

      return null;

    }


    const payload =
      parts[1];


    const base64 =
      payload
        .replace(
          /-/g,
          "+"
        )
        .replace(
          /_/g,
          "/"
        );


    const json =
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            character =>
              "%" +
              (
                "00" +
                character
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)
          )
          .join("")
      );


    const data =
      JSON.parse(
        json
      );


    return {

      id:
        data.sub ||
        null,

      email:
        data.email ||
        null,

      name:
        data.name ||
        null,

      photoURL:
        data.picture ||
        null

    };

  } catch (
    error
  ) {

    console.warn(
      "REELIQ: Unable to decode Google credential.",
      error
    );


    return null;

  }

}


/* =====================================================
   STATUS
===================================================== */

export function isGoogleAuthAvailable() {

  return Boolean(
    GOOGLE_CLIENT_ID
  );

}


/* =====================================================
   DEBUG
===================================================== */

export function getGoogleAuthInfo() {

  return {

    provider:
      "google",

    configured:
      Boolean(
        GOOGLE_CLIENT_ID
      ),

    script:
      GOOGLE_SCRIPT_URL

  };

}

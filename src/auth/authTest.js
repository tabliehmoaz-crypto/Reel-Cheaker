/*
  REELIQ — AUTH TEST
*/

import { signInWithGoogle, logout, observeAuth } from "./googleAuth.js";

export function initAuthTest() {
  const loginButton = document.getElementById("googleLoginBtn");
  const logoutButton = document.getElementById("googleLogoutBtn");
  const userInfo = document.getElementById("googleUserInfo");

  if (!loginButton || !logoutButton || !userInfo) {
    console.warn("REELIQ Auth UI elements not found.");
    return;
  }

  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    loginButton.textContent = "جاري تسجيل الدخول...";

    const result = await signInWithGoogle();

    if (result.success) {
      userInfo.textContent = `مرحباً ${result.user.name || result.user.email}`;
      loginButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      alert("فشل تسجيل الدخول: " + result.error);
      loginButton.disabled = false;
      loginButton.textContent = "تسجيل الدخول بواسطة Google";
    }
  });

  logoutButton.addEventListener("click", async () => {
    const success = await logout();

    if (success) {
      userInfo.textContent = "غير مسجل الدخول";
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
      loginButton.disabled = false;
      loginButton.textContent = "تسجيل الدخول بواسطة Google";
    }
  });

  observeAuth((user) => {
    if (user) {
      userInfo.textContent = `مرحباً ${user.name || user.email}`;
      loginButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      userInfo.textContent = "غير مسجل الدخول";
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
    }
  });
}

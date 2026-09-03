/*
  MTI — Application Core
  v2 Offline Engine
*/

import { initializeAccount, getAccount } from "../memory/AccountMemory.js";

class MTIApp {
  constructor() {
    this.account = null;
    this.initialized = false;
  }

  init(accountData = {}) {
    if (this.initialized) {
      return this.account;
    }

    this.account = initializeAccount(accountData);
    this.initialized = true;

    return this.account;
  }

  getAccount() {
    if (!this.initialized) {
      this.init();
    }

    return getAccount();
  }

  isReady() {
    return this.initialized;
  }
}

export const mtiApp = new MTIApp();

export default mtiApp;

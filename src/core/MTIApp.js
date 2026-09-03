/*
  MTI — Application Core
  -----------------------
  المسؤول عن الحالة العامة للتطبيق.

  MTIApp لا يتعامل مع Memory مباشرة.
  كل عمليات الذاكرة تمر عبر MTIMemoryService.
*/


import { memoryService } from "./MTIMemoryService.js";



/* =========================================================
   MTI APPLICATION
========================================================= */


class MTIApp {


  constructor() {

    this.account =
      null;

    this.initialized =
      false;

  }



  /* =======================================================
     INITIALIZE
  ======================================================= */


  init(
    accountData = {}
  ) {

    if (
      this.initialized
    ) {

      return this.account;

    }


    this.account =
      memoryService.initialize(
        accountData
      );


    this.initialized =
      true;


    return this.account;

  }



  /* =======================================================
     ACCOUNT
  ======================================================= */


  getAccount() {

    if (
      !this.initialized
    ) {

      this.init();

    }


    return memoryService.getAccount();

  }



  /* =======================================================
     ACTIVE ACCOUNT
  ======================================================= */


  getActiveAccountId() {

    return memoryService.getActiveAccountId();

  }



  /* =======================================================
     CHANGE ACCOUNT
  ======================================================= */


  setAccount(
    accountData = {}
  ) {

    this.account =
      memoryService.setAccount(
        accountData
      );


    this.initialized =
      true;


    return this.account;

  }



  /* =======================================================
     STATE
  ======================================================= */


  isReady() {

    return (
      this.initialized &&
      memoryService.isReady()
    );

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIApp",

      version:
        "2.0.0",

      localFirst:
        true,

      memory:
        memoryService.getInfo(),

      account:
        this.account

    };

  }

}



/* =========================================================
   SINGLETON
========================================================= */


export const mtiApp =
  new MTIApp();



export default mtiApp;

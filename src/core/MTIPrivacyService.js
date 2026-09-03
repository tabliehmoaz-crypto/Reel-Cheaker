/*
  MTI — Privacy Service
  ---------------------
  Privacy Firewall بين بيانات المستخدم الخاصة
  وأي بيانات ممكن تستخدم خارج الحساب.

  المسؤوليات:
  - تحديد البيانات الخاصة
  - إزالة الهوية
  - إزالة المحتوى الخام
  - إزالة الملاحظات والمحادثات
  - إزالة المعرفات الحساسة
  - تجهيز بيانات آمنة للتعلم الجماعي
  - منع تسريب بيانات الحساب

  مهم جداً:
  هذا الملف لا يرسل أي بيانات إلى أي خدمة خارجية.

  Local-First:
  true
*/


const PRIVACY_VERSION =
  "1.0.0";


const SENSITIVE_KEYS = [

  "userId",
  "uid",
  "accountId",

  "email",
  "phone",
  "name",
  "displayName",

  "username",
  "handle",

  "avatar",
  "profile",
  "profileUrl",

  "accessToken",
  "refreshToken",
  "token",

  "ip",
  "ipAddress",

  "deviceId",
  "sessionId",

  "location",
  "address",

  "notes",
  "note",

  "conversation",
  "messages",

  "rawVideo",
  "videoFile",
  "file",
  "blob",

  "url",
  "videoUrl",
  "sourceUrl",

  "caption",
  "description"

];


const PRIVATE_KEYS = [

  "privateMemory",
  "private_memory",

  "account",
  "accountData",

  "personalData",

  "userData",

  "metadata"

];


const PUBLIC_SAFE_KEYS = [

  "version",
  "scores",
  "overall",

  "hook",
  "retention",
  "visual",
  "audio",
  "text",
  "pacing",

  "storytelling",
  "psychology",

  "speech",
  "idea",

  "technical",
  "dropOff",
  "diagnosis",

  "prediction",
  "recommendations",

  "performance",
  "comparison",

  "learning"

];



/* =========================================================
   PRIVACY SERVICE
========================================================= */


export class MTIPrivacyService {


  constructor(
    options = {}
  ) {

    this.version =
      options.version ||
      PRIVACY_VERSION;


    this.strict =
      options.strict !== false;


    this.lastError =
      null;

  }



  /* =======================================================
     CHECK DATA
  ======================================================= */


  isPrivateKey(
    key
  ) {

    if (!key) {

      return false;

    }


    const normalized =
      String(key)
        .trim()
        .toLowerCase();


    return [

      ...SENSITIVE_KEYS,
      ...PRIVATE_KEYS

    ]
      .map(
        item =>
          item.toLowerCase()
      )
      .includes(
        normalized
      );

  }



  isSafeKey(
    key
  ) {

    if (!key) {

      return false;

    }


    return PUBLIC_SAFE_KEYS
      .map(
        item =>
          item.toLowerCase()
      )
      .includes(
        String(key)
          .toLowerCase()
      );

  }



  /* =======================================================
     REMOVE PRIVATE DATA
  ======================================================= */


  sanitize(
    data
  ) {

    this.lastError =
      null;


    try {

      return this.sanitizeValue(
        data
      );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  sanitizeValue(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {

      return value;

    }


    if (
      typeof value !==
      "object"
    ) {

      return value;

    }


    if (
      Array.isArray(value)
    ) {

      return value
        .map(
          item =>
            this.sanitizeValue(
              item
            )
        );

    }


    const output = {};


    for (
      const [
        key,
        child
      ]
      of Object.entries(value)
    ) {

      if (
        this.isPrivateKey(
          key
        )
      ) {

        continue;

      }


      output[key] =
        this.sanitizeValue(
          child
        );

    }


    return output;

  }



  /* =======================================================
     PREPARE GLOBAL LEARNING DATA
  ======================================================= */


  prepareForGlobalLearning(
    data
  ) {

    if (!data) {

      throw new Error(
        "لا توجد بيانات لتحضيرها للتعلم الجماعي."
      );

    }


    const sanitized =
      this.sanitize(
        data
      );


    return {

      privacyVersion:
        this.version,

      anonymous:
        true,

      containsIdentity:
        false,

      containsRawContent:
        false,

      containsPrivateNotes:
        false,

      containsConversation:
        false,

      data:
        sanitized

    };

  }



  /* =======================================================
     ANONYMIZE RESULT
  ======================================================= */


  anonymizeResult(
    result
  ) {

    const safe =
      this.sanitize(
        result
      );


    return {

      ...safe,

      anonymous:
        true,

      identity:
        null,

      userId:
        null,

      accountId:
        null

    };

  }



  /* =======================================================
     CREATE AGGREGATE SIGNAL
  ======================================================= */


  createAggregateSignal(
    data = {}
  ) {

    const safe =
      this.sanitize(
        data
      );


    return {

      privacyVersion:
        this.version,

      anonymous:
        true,

      aggregate:
        true,

      sample:

        Number.isFinite(
          data.sample
        )
          ? data.sample
          : 1,

      signal:
        safe

    };

  }



  /* =======================================================
     VERIFY NO IDENTITY
  ======================================================= */


  containsPrivateData(
    data
  ) {

    if (
      data === null ||
      data === undefined
    ) {

      return false;

    }


    if (
      typeof data !==
      "object"
    ) {

      return false;

    }


    if (
      Array.isArray(data)
    ) {

      return data.some(
        item =>
          this.containsPrivateData(
            item
          )
      );

    }


    for (
      const [
        key,
        value
      ]
      of Object.entries(data)
    ) {

      if (
        this.isPrivateKey(
          key
        )
      ) {

        return true;

      }


      if (
        this.containsPrivateData(
          value
        )
      ) {

        return true;

      }

    }


    return false;

  }



  /* =======================================================
     PRIVACY CHECK
  ======================================================= */


  validatePublicData(
    data
  ) {

    if (
      this.containsPrivateData(
        data
      )
    ) {

      return {

        safe:
          false,

        reason:
          "البيانات تحتوي معلومات خاصة."

      };

    }


    return {

      safe:
        true,

      reason:
        null

    };

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIPrivacyService",

      version:
        this.version,

      localFirst:
        true,

      externalAPI:
        false,

      identityProtection:
        true,

      rawContentProtection:
        true,

      accountIsolation:
        true,

      globalLearningProtection:
        true

    };

  }



  /* =======================================================
     ERROR
  ======================================================= */


  getLastError() {

    return this.lastError;

  }



  resetError() {

    this.lastError =
      null;

  }

}



/* =========================================================
   FACTORY
========================================================= */


export function createPrivacyService(
  options = {}
) {

  return new MTIPrivacyService(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const privacyService =
  new MTIPrivacyService();



export default privacyService;

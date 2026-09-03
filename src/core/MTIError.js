/*
  MTI — Error System
  Centralized error handling and classification.
*/

export const MTI_ERROR_TYPES = Object.freeze({

  VALIDATION:
    "validation",

  AUTH:
    "auth",

  ENGINE:
    "engine",

  AI:
    "ai",

  MEMORY:
    "memory",

  STORAGE:
    "storage",

  NETWORK:
    "network",

  MEDIA:
    "media",

  RECOMMENDATION:
    "recommendation",

  UNKNOWN:
    "unknown"

});


export const MTI_ERROR_SEVERITY = Object.freeze({

  INFO:
    "info",

  WARNING:
    "warning",

  ERROR:
    "error",

  CRITICAL:
    "critical"

});


export class MTIError extends Error {

  constructor(message, options = {}) {

    super(message);

    this.name =
      "MTIError";

    this.type =
      options.type ||
      MTI_ERROR_TYPES.UNKNOWN;

    this.severity =
      options.severity ||
      MTI_ERROR_SEVERITY.ERROR;

    this.code =
      options.code ||
      "MTI_ERROR";

    this.stage =
      options.stage ||
      null;

    this.details =
      options.details ||
      null;

    this.originalError =
      options.originalError ||
      null;

    this.recoverable =
      options.recoverable !== undefined
        ? Boolean(options.recoverable)
        : true;

    this.timestamp =
      new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(
        this,
        MTIError
      );
    }

  }


  toJSON() {

    return {

      name:
        this.name,

      message:
        this.message,

      type:
        this.type,

      severity:
        this.severity,

      code:
        this.code,

      stage:
        this.stage,

      details:
        this.details,

      recoverable:
        this.recoverable,

      timestamp:
        this.timestamp

    };

  }

}


export function createMTIError(
  message,
  options = {}
) {

  return new MTIError(
    message,
    options
  );

}


export function normalizeMTIError(
  error,
  fallback = {}
) {

  if (error instanceof MTIError) {
    return error;
  }


  if (error instanceof Error) {

    return new MTIError(
      error.message,
      {
        ...fallback,
        originalError: error
      }
    );

  }


  if (typeof error === "string") {

    return new MTIError(
      error,
      fallback
    );

  }


  return new MTIError(
    fallback.message ||
      "حدث خطأ غير معروف.",
    {
      ...fallback,
      details: error
    }
  );

}


export function isMTIError(error) {

  return error instanceof MTIError;

}


export function isRecoverableError(error) {

  const normalized =
    normalizeMTIError(error);

  return normalized.recoverable;

}


export function getErrorMessage(error) {

  const normalized =
    normalizeMTIError(error);

  return normalized.message;

}


export default MTIError;

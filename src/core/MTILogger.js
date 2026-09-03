/*
  MTI — Logger
  Centralized application logging.

  Responsibility:
  - Keep logging consistent across MTI.
  - Support debug/info/warn/error levels.
  - Avoid noisy production logs.
  - Keep logging independent from UI.
*/

import MTI_CONFIG from "./MTIConfig.js";


const LEVELS = Object.freeze({
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error"
});


function timestamp() {
  return new Date().toISOString();
}


function shouldLog(level) {

  if (level === LEVELS.ERROR) {
    return true;
  }

  if (level === LEVELS.WARN) {
    return true;
  }

  if (level === LEVELS.INFO) {
    return MTI_CONFIG.development.verboseLogging;
  }

  if (level === LEVELS.DEBUG) {
    return MTI_CONFIG.development.debug;
  }

  return false;
}


function normalizeData(data) {

  if (data === undefined) {
    return null;
  }

  try {
    return JSON.parse(
      JSON.stringify(data)
    );
  } catch {
    return data;
  }
}


class MTILogger {

  constructor(options = {}) {

    this.name =
      options.name || "MTI";

    this.enabled =
      options.enabled !== undefined
        ? options.enabled
        : true;

    this.history = [];

    this.maxHistory =
      options.maxHistory || 200;

  }


  _write(level, message, data = null) {

    if (!this.enabled) {
      return;
    }

    if (!shouldLog(level)) {
      return;
    }


    const entry = {

      timestamp:
        timestamp(),

      level,

      message,

      data:
        normalizeData(data)

    };


    this.history.push(entry);


    if (
      this.history.length >
      this.maxHistory
    ) {

      this.history.shift();

    }


    const prefix =
      `[${this.name}]`;


    if (level === LEVELS.ERROR) {

      console.error(
        prefix,
        message,
        data ?? ""
      );

      return;

    }


    if (level === LEVELS.WARN) {

      console.warn(
        prefix,
        message,
        data ?? ""
      );

      return;

    }


    if (level === LEVELS.INFO) {

      console.info(
        prefix,
        message,
        data ?? ""
      );

      return;

    }


    console.debug(
      prefix,
      message,
      data ?? ""
    );

  }


  debug(message, data = null) {

    this._write(
      LEVELS.DEBUG,
      message,
      data
    );

  }


  info(message, data = null) {

    this._write(
      LEVELS.INFO,
      message,
      data
    );

  }


  warn(message, data = null) {

    this._write(
      LEVELS.WARN,
      message,
      data
    );

  }


  error(message, data = null) {

    this._write(
      LEVELS.ERROR,
      message,
      data
    );

  }


  clear() {

    this.history = [];

  }


  getHistory() {

    return [
      ...this.history
    ];

  }


  getStats() {

    const stats = {

      total: this.history.length,

      debug: 0,

      info: 0,

      warn: 0,

      error: 0

    };


    for (const entry of this.history) {

      if (
        Object.prototype.hasOwnProperty.call(
          stats,
          entry.level
        )
      ) {

        stats[entry.level]++;

      }

    }


    return stats;

  }


  setEnabled(enabled) {

    this.enabled =
      Boolean(enabled);

    return this;

  }


  setMaxHistory(maxHistory) {

    if (
      Number.isFinite(maxHistory) &&
      maxHistory > 0
    ) {

      this.maxHistory =
        Math.floor(maxHistory);

    }


    return this;

  }

}


export const logger =
  new MTILogger();


export {
  MTILogger,
  LEVELS
};


export default logger;

/*
  MTI — Event Bus
  Lightweight internal communication layer.

  Responsibility:
  - Allow MTI modules to communicate without direct coupling.
  - Support analysis lifecycle events.
  - Keep UI, Engine, AI and Memory independent.
*/

export class EventBus {

  constructor() {

    this.listeners = new Map();

  }


  on(event, callback) {

    if (!event || typeof callback !== "function") {
      return () => {};
    }


    if (!this.listeners.has(event)) {
      this.listeners.set(
        event,
        new Set()
      );
    }


    const callbacks =
      this.listeners.get(event);

    callbacks.add(callback);


    return () => {
      this.off(event, callback);
    };

  }


  once(event, callback) {

    if (!event || typeof callback !== "function") {
      return () => {};
    }


    const unsubscribe =
      this.on(event, (...args) => {

        unsubscribe();

        callback(...args);

      });


    return unsubscribe;

  }


  off(event, callback) {

    const callbacks =
      this.listeners.get(event);


    if (!callbacks) {
      return false;
    }


    const removed =
      callbacks.delete(callback);


    if (callbacks.size === 0) {
      this.listeners.delete(event);
    }


    return removed;

  }


  emit(event, payload = {}) {

    const callbacks =
      this.listeners.get(event);


    if (!callbacks) {
      return [];
    }


    const results = [];


    for (const callback of [...callbacks]) {

      try {

        results.push(
          callback(payload)
        );

      } catch (error) {

        console.error(
          `MTI EventBus error in "${event}":`,
          error
        );

      }

    }


    return results;

  }


  async emitAsync(event, payload = {}) {

    const callbacks =
      this.listeners.get(event);


    if (!callbacks) {
      return [];
    }


    const results = [];


    for (const callback of [...callbacks]) {

      try {

        results.push(
          await callback(payload)
        );

      } catch (error) {

        console.error(
          `MTI EventBus async error in "${event}":`,
          error
        );

      }

    }


    return results;

  }


  has(event) {

    return this.listeners.has(event);

  }


  clear(event = null) {

    if (event) {

      this.listeners.delete(event);

      return;

    }


    this.listeners.clear();

  }


  listenerCount(event) {

    const callbacks =
      this.listeners.get(event);

    return callbacks
      ? callbacks.size
      : 0;

  }


  getEvents() {

    return [
      ...this.listeners.keys()
    ];

  }

}


/*
  Shared application event bus.

  All MTI modules can import this instance
  instead of creating their own buses.
*/

export const eventBus =
  new EventBus();


/*
  Standard MTI lifecycle events.

  Keeping event names centralized prevents
  spelling mistakes across modules.
*/

export const MTI_EVENTS = Object.freeze({

  APP_INITIALIZED:
    "mti:app:initialized",

  ACCOUNT_READY:
    "mti:account:ready",

  JOB_CREATED:
    "mti:job:created",

  JOB_STARTED:
    "mti:job:started",

  PROCESSING_STARTED:
    "mti:processing:started",

  PROCESSING_COMPLETED:
    "mti:processing:completed",

  ANALYSIS_STARTED:
    "mti:analysis:started",

  ANALYSIS_COMPLETED:
    "mti:analysis:completed",

  ANALYSIS_SAVED:
    "mti:analysis:saved",

  RECOMMENDATIONS_STARTED:
    "mti:recommendations:started",

  RECOMMENDATIONS_COMPLETED:
    "mti:recommendations:completed",

  MEMORY_UPDATED:
    "mti:memory:updated",

  JOB_COMPLETED:
    "mti:job:completed",

  JOB_FAILED:
    "mti:job:failed",

  ERROR:
    "mti:error"

});


export default eventBus;

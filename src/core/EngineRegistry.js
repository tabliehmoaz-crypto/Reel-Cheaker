/*
  MTI — Engine Registry
  Central registry for analysis engines.

  Responsibility:
  - Register available engines.
  - Select the active engine.
  - Keep Core independent from engine internals.
  - Allow future engines to be added without changing Core.
*/

import EngineAdapter from "./EngineAdapter.js";


export class EngineRegistry {

  constructor() {

    this.engines = new Map();

    this.activeEngine =
      null;

  }


  register(
    name,
    engine
  ) {

    if (!name) {

      throw new Error(
        "MTI EngineRegistry: engine name is required."
      );

    }


    if (!engine) {

      throw new Error(
        `MTI EngineRegistry: engine "${name}" is invalid.`
      );

    }


    const adapter =
      engine instanceof EngineAdapter
        ? engine
        : new EngineAdapter({
            engine,
            engineName: name
          });


    this.engines.set(
      name,
      adapter
    );


    if (!this.activeEngine) {

      this.activeEngine =
        name;

    }


    return adapter;

  }


  unregister(name) {

    if (!this.engines.has(name)) {
      return false;
    }


    this.engines.delete(name);


    if (
      this.activeEngine === name
    ) {

      const remaining =
        [...this.engines.keys()];

      this.activeEngine =
        remaining.length > 0
          ? remaining[0]
          : null;

    }


    return true;

  }


  has(name) {

    return this.engines.has(name);

  }


  get(name) {

    return (
      this.engines.get(name) ||
      null
    );

  }


  setActive(name) {

    if (!this.engines.has(name)) {

      throw new Error(
        `MTI EngineRegistry: engine "${name}" is not registered.`
      );

    }


    this.activeEngine =
      name;


    return this.get(name);

  }


  getActive() {

    if (!this.activeEngine) {
      return null;
    }


    return this.get(
      this.activeEngine
    );

  }


  getActiveName() {

    return this.activeEngine;

  }


  list() {

    return [
      ...this.engines.keys()
    ];

  }


  getInfo() {

    return {

      active:
        this.activeEngine,

      engines:
        this.list(),

      count:
        this.engines.size

    };

  }


  clear() {

    this.engines.clear();

    this.activeEngine =
      null;

  }

}


export const engineRegistry =
  new EngineRegistry();


export default engineRegistry;

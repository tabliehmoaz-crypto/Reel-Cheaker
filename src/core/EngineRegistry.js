/*
  MTI — Engine Registry
  ---------------------
  Central registry for MTI engines.

  Engines:
  - ExperimentEngine → experiment lifecycle / learning
  - ReelEngine → local video analysis

  Core should communicate with engines
  through their adapters only.
*/

import EngineAdapter
  from "./EngineAdapter.js";

import ReelEngineAdapter
  from "./ReelEngineAdapter.js";


export class EngineRegistry {

  constructor() {

    this.engines =
      new Map();

    this.activeEngine =
      null;

  }


  /* ===================================================
     REGISTER
  =================================================== */

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


    let adapter;


    /*
      Experiment Engine
    */

    if (
      engine instanceof
      EngineAdapter
    ) {

      adapter =
        engine;

    }


    /*
      Reel Analysis Engine
    */

    else if (
      engine instanceof
      ReelEngineAdapter
    ) {

      adapter =
        engine;

    }


    /*
      Generic engine compatibility
    */

    else {

      adapter =
        this.createAdapter(
          name,
          engine
        );

    }


    this.engines.set(
      name,
      adapter
    );


    /*
      First registered engine
      becomes active automatically.
    */

    if (
      !this.activeEngine
    ) {

      this.activeEngine =
        name;

    }


    return adapter;

  }


  /* ===================================================
     CREATE ADAPTER
  =================================================== */

  createAdapter(
    name,
    engine
  ) {

    /*
      Reel engine exposes analyzeReel
      through the Reel adapter.
    */

    if (
      typeof engine?.analyze ===
      "function"
    ) {

      return new ReelEngineAdapter({

        engineName:
          name

      });

    }


    /*
      Default:
      Experiment Engine adapter.
    */

    return new EngineAdapter({

      engine,

      engineName:
        name

    });

  }


  /* ===================================================
     REGISTER DEFAULT ENGINES
  =================================================== */

  registerDefaults(
    experimentEngine = null,
    reelEngine = null
  ) {

    if (
      experimentEngine
    ) {

      this.register(
        "ExperimentEngine",
        experimentEngine
      );

    }


    if (
      reelEngine
    ) {

      this.register(
        "reel-engine",
        reelEngine
      );

    }


    return this.getInfo();

  }


  /* ===================================================
     UNREGISTER
  =================================================== */

  unregister(
    name
  ) {

    if (
      !this.engines.has(
        name
      )
    ) {

      return false;

    }


    this.engines.delete(
      name
    );


    if (
      this.activeEngine ===
      name
    ) {

      const remaining =
        [
          ...this.engines.keys()
        ];


      this.activeEngine =
        remaining.length
          ? remaining[0]
          : null;

    }


    return true;

  }


  /* ===================================================
     HAS
  =================================================== */

  has(
    name
  ) {

    return this.engines.has(
      name
    );

  }


  /* ===================================================
     GET
  =================================================== */

  get(
    name
  ) {

    return (
      this.engines.get(
        name
      ) ||
      null
    );

  }


  /* ===================================================
     ACTIVE
  =================================================== */

  setActive(
    name
  ) {

    if (
      !this.engines.has(
        name
      )
    ) {

      throw new Error(
        `MTI EngineRegistry: engine "${name}" is not registered.`
      );

    }


    this.activeEngine =
      name;


    return this.get(
      name
    );

  }


  getActive() {

    if (
      !this.activeEngine
    ) {

      return null;

    }


    return this.get(
      this.activeEngine
    );

  }


  getActiveName() {

    return this.activeEngine;

  }


  /* ===================================================
     LIST
  =================================================== */

  list() {

    return [
      ...this.engines.keys()
    ];

  }


  /* ===================================================
     FIND ENGINE
  =================================================== */

  find(
    name
  ) {

    return this.get(
      name
    );

  }


  /* ===================================================
     ANALYSIS ENGINE
  =================================================== */

  getAnalysisEngine() {

    if (
      this.has(
        "reel-engine"
      )
    ) {

      return this.get(
        "reel-engine"
      );

    }


    return null;

  }


  /* ===================================================
     EXPERIMENT ENGINE
  =================================================== */

  getExperimentEngine() {

    if (
      this.has(
        "ExperimentEngine"
      )
    ) {

      return this.get(
        "ExperimentEngine"
      );

    }


    return null;

  }


  /* ===================================================
     INFO
  =================================================== */

  getInfo() {

    const engines = {};


    for (
      const [
        name,
        engine
      ]
      of this.engines
    ) {

      let info = null;


      try {

        if (
          typeof engine.getEngineInfo ===
          "function"
        ) {

          info =
            engine.getEngineInfo();

        }

      } catch {

        info = {

          status:
            "error"

        };

      }


      engines[name] = {

        name,

        ...(info || {})

      };

    }


    return {

      active:
        this.activeEngine,

      engines,

      count:
        this.engines.size

    };

  }


  /* ===================================================
     HEALTH CHECK
  =================================================== */

  healthCheck() {

    const results = {};


    for (
      const [
        name,
        engine
      ]
      of this.engines
    ) {

      try {

        if (
          typeof engine.healthCheck ===
          "function"
        ) {

          results[name] =
            engine.healthCheck();

        } else {

          results[name] = {

            ready:
              typeof engine.isReady ===
              "function"
                ? engine.isReady()
                : true

          };

        }

      } catch (error) {

        results[name] = {

          ready:
            false,

          error:
            error?.message ||
            "Unknown engine error"

        };

      }

    }


    return results;

  }


  /* ===================================================
     CLEAR
  =================================================== */

  clear() {

    this.engines.clear();

    this.activeEngine =
      null;

  }

}


/* =====================================================
   SINGLETON
===================================================== */

export const engineRegistry =
  new EngineRegistry();


export default engineRegistry;

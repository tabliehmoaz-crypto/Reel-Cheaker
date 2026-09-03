/*
  MTI — Engine Setup
  ------------------
  مسؤول عن تجهيز وربط محركات MTI.

  المحركات:
  - ExperimentEngine → إدارة التجارب والنتائج والتعلّم
  - reel-engine     → تحليل الفيديو محلياً

  هذا الملف لا يحتوي منطق تحليل.
  فقط يجهّز المحركات ويسجلها داخل EngineRegistry.
*/

import EngineAdapter from "./EngineAdapter.js";
import ReelEngineAdapter from "./ReelEngineAdapter.js";
import engineRegistry from "./EngineRegistry.js";


let initialized = false;


/**
 * Initialize MTI engines.
 *
 * Safe to call more than once.
 */
export function initializeEngines() {

  if (initialized) {
    return engineRegistry;
  }


  const experimentEngine =
    new EngineAdapter({
      engineName: "ExperimentEngine",
      version: "2.0.0"
    });


  const reelEngine =
    new ReelEngineAdapter({
      engineName: "reel-engine",
      version: "3.0-local-first"
    });


  engineRegistry.register(
    "ExperimentEngine",
    experimentEngine
  );


  engineRegistry.register(
    "reel-engine",
    reelEngine
  );


  // The reel engine is the active analysis engine.
  engineRegistry.setActive(
    "reel-engine"
  );


  initialized = true;


  return engineRegistry;
}


/**
 * Get the currently configured engine registry.
 *
 * Automatically initializes engines
 * if setup has not happened yet.
 */
export function getEngineRegistry() {

  if (!initialized) {
    initializeEngines();
  }

  return engineRegistry;
}


/**
 * Get the active analysis engine.
 */
export function getActiveAnalysisEngine() {

  const registry =
    getEngineRegistry();

  return registry.getActive();
}


/**
 * Get ExperimentEngine adapter.
 */
export function getExperimentEngine() {

  const registry =
    getEngineRegistry();

  return registry.get(
    "ExperimentEngine"
  );
}


/**
 * Get Reel Analysis Engine adapter.
 */
export function getReelEngine() {

  const registry =
    getEngineRegistry();

  return registry.get(
    "reel-engine"
  );
}


/**
 * Check engine health.
 */
export function checkEngineHealth() {

  const registry =
    getEngineRegistry();

  return registry.healthCheck();
}


/**
 * Reset setup state.
 *
 * Useful later for development
 * and controlled re-initialization.
 */
export function resetEngineSetup() {

  engineRegistry.clear();

  initialized = false;

}


export default initializeEngines;

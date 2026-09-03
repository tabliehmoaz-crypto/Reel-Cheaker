/*
  MTI — Analysis Orchestrator
  ---------------------------
  قلب دورة تحليل الريل.

  المسؤولية:
  1. إنشاء Experiment
  2. تشغيل التحليل المحلي
  3. حفظ نتيجة التحليل
  4. تجهيز مكان للتنبؤ
  5. حفظ التوصيات
  6. تحديث حالة التجربة
  7. إبقاء كل مرحلة مستقلة عن الأخرى

  هذا الملف لا يحتوي منطق التحليل نفسه.
  هو فقط ينسّق المراحل.
*/

import {
  createExperiment,
  saveExperiment,
  setExperimentStatus,
  attachAnalysis
} from "../engine/ExperimentEngine.js";

import analysisService from "./MTIAnalysisService.js";
import { normalizeError } from "./MTIError.js";


export class MTIAnalysisOrchestrator {

  constructor(options = {}) {

    this.analysisService =
      options.analysisService ||
      analysisService;

    this.lastError =
      null;

  }


  async analyze(
    file,
    options = {}
  ) {

    this.lastError =
      null;


    let experiment = null;


    try {

      // --------------------------------------------------
      // 1. Validate input
      // --------------------------------------------------

      if (!file) {

        throw new Error(
          "لم يتم اختيار فيديو."
        );

      }


      if (
        !file.type ||
        !file.type.startsWith("video/")
      ) {

        throw new Error(
          "الملف المختار ليس فيديو."
        );

      }


      // --------------------------------------------------
      // 2. Create experiment
      // --------------------------------------------------

      experiment =
        createExperiment({

          title:
            options.title ||
            file.name ||
            "Untitled Reel",

          source:
            "local-upload",

          platform:
            options.platform ||
            "instagram",

          file: {

            name:
              file.name,

            type:
              file.type,

            size:
              file.size

          },

          metadata: {

            createdFrom:
              "MTI",

            engine:
              "reel-engine"

          }

        });


      saveExperiment(
        experiment
      );


      // --------------------------------------------------
      // 3. Mark as processing
      // --------------------------------------------------

      setExperimentStatus(
        experiment.id,
        "DRAFT"
      );


      // --------------------------------------------------
      // 4. Run local analysis
      // --------------------------------------------------

      const analysis =
        await this.analysisService.analyze(
          file,
          options
        );


      // --------------------------------------------------
      // 5. Attach analysis
      // --------------------------------------------------

      const updatedExperiment =
        attachAnalysis(
          experiment.id,
          analysis
        );


      // --------------------------------------------------
      // 6. Mark as analyzed
      // --------------------------------------------------

      setExperimentStatus(
        experiment.id,
        "ANALYZED"
      );


      // --------------------------------------------------
      // 7. Return complete result
      // --------------------------------------------------

      return {

        success:
          true,

        experiment:
          updatedExperiment ||
          experiment,

        analysis,

        prediction:
          null,

        recommendations:
          analysis?.recommendations ||
          [],

        learning:
          null

      };

    } catch (error) {

      const normalized =
        normalizeError(
          error,
          {
            stage:
              "analysis-orchestration",

            details: {

              experimentId:
                experiment?.id ||
                null

            }

          }
        );


      this.lastError =
        normalized;


      return {

        success:
          false,

        experiment,

        analysis:
          null,

        prediction:
          null,

        recommendations:
          [],

        learning:
          null,

        error:
          normalized

      };

    }

  }


  getLastError() {

    return this.lastError;

  }


  resetError() {

    this.lastError =
      null;

  }

}


export function createAnalysisOrchestrator(
  options = {}
) {

  return new MTIAnalysisOrchestrator(
    options
  );

}


export const analysisOrchestrator =
  new MTIAnalysisOrchestrator();


export default analysisOrchestrator;

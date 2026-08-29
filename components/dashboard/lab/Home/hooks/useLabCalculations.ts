"use client";

import { useEffect } from "react";

export interface LabTestItem {
  _id: string;
  value: string | number | undefined;
  name: {
    _id?: string;
    code?: string;
    name?: string;
    type?: string;
    dataType?: "number" | "text" | "boolean" | "options";
    unit?: string;
    [key: string]: any;
  };
}

/**
 * Custom hook to handle auto-calculations for clinical lab test panels:
 * - Lipid Profile: VLDL, LDL, Chol/HDL Ratio, LDL/HDL Ratio
 * - Liver Function Test (LFT): Globulin, A/G Ratio
 * - Bilirubin: Indirect Bilirubin
 * - Glycated Hemoglobin: Mean Blood Glucose Value (MBGV / eAG)
 * - CBC / Hematology: Mentzer Index, RDWI
 */
export const useLabCalculations = (
  tests: LabTestItem[],
  onUpdateTests: (newTests: LabTestItem[]) => void
) => {
  useEffect(() => {
    const normalize = (str?: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const findTest = (identifiers: string[]) => {
      const normIds = identifiers.map((id) => normalize(id));
      return tests.find((t) => {
        const nameNorm = normalize(t.name?.name);
        const codeNorm = normalize(t.name?.code);
        return normIds.includes(nameNorm) || normIds.includes(codeNorm);
      });
    };

    let isChanged = false;
    const newTests = [...tests];

    const updateCalculatedValue = (identifiers: string[], value: string | number) => {
      const normIds = identifiers.map((id) => normalize(id));
      const index = newTests.findIndex((t) => {
        const nameNorm = normalize(t.name?.name);
        const codeNorm = normalize(t.name?.code);
        return normIds.includes(nameNorm) || normIds.includes(codeNorm);
      });
      if (index !== -1) {
        const currentVal = newTests[index].value?.toString();
        const nextVal = value.toString();
        if (currentVal !== nextVal) {
          newTests[index] = { ...newTests[index], value: nextVal };
          isChanged = true;
        }
      }
    };

    // 1. LIPID PROFILE
    const tcTest = findTest(["TOTAL CHOLESTEROL", "CHO", "TC", "CHOLESTEROL"]);
    const tgTest = findTest(["TRIGLYCERIDE", "TG", "TRIGLYCERIDES"]);
    const hdlTest = findTest(["HDL (DIRECT)", "HDL", "HDL CHOLESTEROL", "DIRECT HDL"]);

    const tc = tcTest?.value ? parseFloat(tcTest.value.toString()) : NaN;
    const tg = tgTest?.value ? parseFloat(tgTest.value.toString()) : NaN;
    const hdl = hdlTest?.value ? parseFloat(hdlTest.value.toString()) : NaN;

    // Calculate VLDL = TRIGLYCERIDE / 5
    if (!isNaN(tg)) {
      updateCalculatedValue(["VLDL", "VLDL CHOLESTEROL"], (tg / 5).toFixed(2));
    }

    // Calculate LDL = TOTAL CHOLESTEROL - HDL - (TRIGLYCERIDE / 5)
    if (!isNaN(tc) && !isNaN(hdl) && !isNaN(tg)) {
      const vldl = tg / 5;
      const ldl = tc - hdl - vldl;
      updateCalculatedValue(["LDL", "LDL CHOLESTEROL", "LDL (DIRECT)", "LDL (CALCULATED)"], ldl.toFixed(2));
    }

    // Calculate Cholesterol / HDL Ratio = TOTAL CHOLESTEROL / HDL
    if (!isNaN(tc) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue(["CHOL/HDL RATIO", "4323", "CHOLESTEROL / HDL RATIO", "TC/HDL RATIO", "CHOL/HDL"], (tc / hdl).toFixed(2));
    }

    // Calculate LDL / HDL Ratio = LDL / HDL
    const ldlTest = findTest(["LDL", "LDL CHOLESTEROL", "LDL (DIRECT)", "LDL (CALCULATED)"]);
    const ldlEntered = ldlTest?.value ? parseFloat(ldlTest.value.toString()) : NaN;
    const ldlCalculated = !isNaN(tc) && !isNaN(hdl) && !isNaN(tg) ? tc - hdl - tg / 5 : NaN;
    const ldlVal = !isNaN(ldlEntered) ? ldlEntered : ldlCalculated;

    if (!isNaN(ldlVal) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue(["LDL/HDL", "5454", "LDL / HDL RATIO", "LDL/HDL RATIO"], (ldlVal / hdl).toFixed(2));
    }

    // 2. LFT / PROTEINS
    const tpTest = findTest(["TOTAL PROTEIN", "TOT", "TP", "TOTAL PROTEINS", "SERUM TOTAL PROTEIN"]);
    const saTest = findTest(["SERUM ALBUMIN", "658", "ALB", "ALBUMIN"]);

    const tp = tpTest?.value ? parseFloat(tpTest.value.toString()) : NaN;
    const sa = saTest?.value ? parseFloat(saTest.value.toString()) : NaN;

    // Serum GLOBULIN = Total Proteins - Serum Albumin
    if (!isNaN(tp) && !isNaN(sa)) {
      const globulin = tp - sa;
      updateCalculatedValue(["GLOBULIN", "1004", "SERUM GLOBULIN", "GLOB"], globulin.toFixed(2));

      // Albumin / Globulin (A/G) Ratio = Serum Albumin / Serum GLOBULIN
      if (globulin !== 0) {
        updateCalculatedValue(
          ["ALB/GLB RATIO", "1005", "ALBUMIN / GLOBULIN RATIO", "ALBUMIN /GLOBULIN(A/G) RATIO", "A/G RATIO"],
          (sa / globulin).toFixed(2)
        );
      }
    }

    // 3. BILIRUBIN (LFT)
    const tBiliTest = findTest(["BILIRUBIN (TOTAL)", "BILI T", "TOTAL BILIRUBIN", "TBIL"]);
    const dBiliTest = findTest(["BILIRUBIN (DIRECT)", "BILI", "DIRECT BILIRUBIN", "DBIL"]);

    const tBili = tBiliTest?.value ? parseFloat(tBiliTest.value.toString()) : NaN;
    const dBili = dBiliTest?.value ? parseFloat(dBiliTest.value.toString()) : NaN;

    // Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
    if (!isNaN(tBili) && !isNaN(dBili)) {
      const iBili = tBili - dBili;
      updateCalculatedValue(["INDIRECT BILIRUBIN", "555", "BILIRUBIN (INDIRECT)", "IBIL"], iBili.toFixed(2));
    }

    // 4. HbA1c -> Mean Blood Glucose Value (MBGV / eAG)
    const hba1cTest = findTest(["HBA1C", "GLYCOSYLATED HEMOGLOBIN", "HB A1C"]);
    const hba1c = hba1cTest?.value ? parseFloat(hba1cTest.value.toString()) : NaN;
    if (!isNaN(hba1c)) {
      const mbgv = 28.7 * hba1c - 46.7;
      updateCalculatedValue(["Mean Blood Glucose Value", "MBGV", "MEAN BLOOD GLUCOSE", "EAG"], mbgv.toFixed(2));
    }

    // 5. CBC / HEMATOLOGY (Mentzer Index & RDWI)
    const mcvTest = findTest(["MCV", "007"]);
    const rbcTest = findTest(["RBC", "RBC (Red Blood Cells)", "RED BLOOD CELL COUNT (RBC)", "1010"]);
    const rdwCvTest = findTest(["RDW-CV", "RDW"]);

    const mcv = mcvTest?.value ? parseFloat(mcvTest.value.toString()) : NaN;
    const rbc = rbcTest?.value ? parseFloat(rbcTest.value.toString()) : NaN;
    const rdwCv = rdwCvTest?.value ? parseFloat(rdwCvTest.value.toString()) : NaN;

    if (!isNaN(mcv) && !isNaN(rbc) && rbc !== 0) {
      const mentzer = mcv / rbc;
      updateCalculatedValue(["*Mentzr", "Mentzer Index", "MENTZER"], mentzer.toFixed(2));
    }

    if (!isNaN(mcv) && !isNaN(rdwCv) && !isNaN(rbc) && rbc !== 0) {
      const rdwi = (mcv * rdwCv) / rbc;
      updateCalculatedValue(["*RDWI", "RDWI", "RDW Index"], rdwi.toFixed(2));
    }

    if (isChanged) {
      onUpdateTests(newTests);
    }
  }, [tests]);
};

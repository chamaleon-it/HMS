"use client";

import { useEffect, useRef } from "react";

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
 *
 * Supports manual override: When a user manually edits an auto-calculated value,
 * it is preserved and not overwritten unless its source input values change.
 */
export const useLabCalculations = (
  tests: LabTestItem[],
  onUpdateTests: (newTests: LabTestItem[]) => void
) => {
  const prevValuesRef = useRef<Record<string, string | undefined>>({});
  const prevTestIdsRef = useRef<string>("");

  useEffect(() => {
    if (!tests || tests.length === 0) return;

    const currentTestIds = tests.map((t) => t._id).join(",");
    const isNewTestSet = prevTestIdsRef.current !== currentTestIds;
    if (isNewTestSet) {
      prevTestIdsRef.current = currentTestIds;
      prevValuesRef.current = {};
    }

    const prevValues = prevValuesRef.current;

    const normalize = (str?: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const findTest = (identifiers: string[], list: LabTestItem[] = tests) => {
      const normIds = identifiers.map((id) => normalize(id));
      return list.find((t) => {
        const nameNorm = normalize(t.name?.name);
        const codeNorm = normalize(t.name?.code);
        return normIds.includes(nameNorm) || normIds.includes(codeNorm);
      });
    };

    const getTestValStr = (identifiers: string[], list: LabTestItem[] = tests): string => {
      const t = findTest(identifiers, list);
      return t?.value !== undefined && t?.value !== null ? t.value.toString().trim() : "";
    };

    const getPrevValStr = (primaryKey: string): string => {
      return prevValues[primaryKey] !== undefined ? prevValues[primaryKey]! : "";
    };

    let isChanged = false;
    const newTests = [...tests];

    const updateCalculatedValue = (
      identifiers: string[],
      value: string | number,
      sourceChanged: boolean
    ) => {
      const normIds = identifiers.map((id) => normalize(id));
      const index = newTests.findIndex((t) => {
        const nameNorm = normalize(t.name?.name);
        const codeNorm = normalize(t.name?.code);
        return normIds.includes(nameNorm) || normIds.includes(codeNorm);
      });

      if (index === -1) return;

      const currentVal = newTests[index].value?.toString().trim() || "";
      const nextVal = value.toString();

      // Only update if source inputs changed or if this is the initial population of an empty field
      const isTargetEmpty = currentVal === "";
      const shouldUpdate = sourceChanged || (isNewTestSet && isTargetEmpty);

      if (shouldUpdate) {
        if (currentVal !== nextVal) {
          newTests[index] = { ...newTests[index], value: nextVal };
          isChanged = true;
        }
      }
    };

    const parseNum = (valStr: string) => {
      if (valStr === "") return NaN;
      const num = parseFloat(valStr);
      return isNaN(num) ? NaN : num;
    };

    // 1. LIPID PROFILE
    const tcStr = getTestValStr(["TOTAL CHOLESTEROL", "CHO", "TC", "CHOLESTEROL"]);
    const tgStr = getTestValStr(["TRIGLYCERIDE", "TG", "TRIGLYCERIDES"]);
    const hdlStr = getTestValStr(["HDL (DIRECT)", "HDL", "HDL CHOLESTEROL", "DIRECT HDL"]);

    const prevTcStr = getPrevValStr("tc");
    const prevTgStr = getPrevValStr("tg");
    const prevHdlStr = getPrevValStr("hdl");

    const tc = parseNum(tcStr);
    const tg = parseNum(tgStr);
    const hdl = parseNum(hdlStr);

    const tgChanged = isNewTestSet ? false : tgStr !== prevTgStr;
    const tcChanged = isNewTestSet ? false : tcStr !== prevTcStr;
    const hdlChanged = isNewTestSet ? false : hdlStr !== prevHdlStr;

    // Calculate VLDL = TRIGLYCERIDE / 5
    if (!isNaN(tg)) {
      updateCalculatedValue(["VLDL", "VLDL CHOLESTEROL"], (tg / 5).toFixed(2), tgChanged);
    }

    // Calculate LDL = TOTAL CHOLESTEROL - HDL - (TRIGLYCERIDE / 5)
    const ldlSourceChanged = tcChanged || hdlChanged || tgChanged;
    if (!isNaN(tc) && !isNaN(hdl) && !isNaN(tg)) {
      const vldl = tg / 5;
      const ldl = tc - hdl - vldl;
      updateCalculatedValue(
        ["LDL", "LDL CHOLESTEROL", "LDL (DIRECT)", "LDL (CALCULATED)"],
        ldl.toFixed(2),
        ldlSourceChanged
      );
    }

    // Calculate Cholesterol / HDL Ratio = TOTAL CHOLESTEROL / HDL
    const cholHdlSourceChanged = tcChanged || hdlChanged;
    if (!isNaN(tc) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue(
        ["CHOL/HDL RATIO", "4323", "CHOLESTEROL / HDL RATIO", "TC/HDL RATIO", "CHOL/HDL"],
        (tc / hdl).toFixed(2),
        cholHdlSourceChanged
      );
    }

    // Calculate LDL / HDL Ratio = LDL / HDL
    const ldlStr = getTestValStr(["LDL", "LDL CHOLESTEROL", "LDL (DIRECT)", "LDL (CALCULATED)"], newTests);
    const prevLdlStr = getPrevValStr("ldl");
    const ldl = parseNum(ldlStr);
    const ldlChanged = isNewTestSet ? false : ldlStr !== prevLdlStr;
    const ldlHdlSourceChanged = ldlChanged || hdlChanged;

    if (!isNaN(ldl) && !isNaN(hdl) && hdl !== 0) {
      updateCalculatedValue(
        ["LDL/HDL", "5454", "LDL / HDL RATIO", "LDL/HDL RATIO"],
        (ldl / hdl).toFixed(2),
        ldlHdlSourceChanged
      );
    }

    // 2. LFT / PROTEINS
    const tpStr = getTestValStr(["TOTAL PROTEIN", "TOT", "TP", "TOTAL PROTEINS", "SERUM TOTAL PROTEIN"]);
    const saStr = getTestValStr(["SERUM ALBUMIN", "658", "ALB", "ALBUMIN"]);

    const prevTpStr = getPrevValStr("tp");
    const prevSaStr = getPrevValStr("sa");

    const tp = parseNum(tpStr);
    const sa = parseNum(saStr);

    const tpChanged = isNewTestSet ? false : tpStr !== prevTpStr;
    const saChanged = isNewTestSet ? false : saStr !== prevSaStr;
    const globulinSourceChanged = tpChanged || saChanged;

    // Serum GLOBULIN = Total Proteins - Serum Albumin
    if (!isNaN(tp) && !isNaN(sa)) {
      const globulin = tp - sa;
      updateCalculatedValue(["GLOBULIN", "1004", "SERUM GLOBULIN", "GLOB"], globulin.toFixed(2), globulinSourceChanged);
    }

    // Albumin / Globulin (A/G) Ratio = Serum Albumin / Serum GLOBULIN
    const globulinStr = getTestValStr(["GLOBULIN", "1004", "SERUM GLOBULIN", "GLOB"], newTests);
    const prevGlobulinStr = getPrevValStr("globulin");
    const globulin = parseNum(globulinStr);
    const globulinChanged = isNewTestSet ? false : globulinStr !== prevGlobulinStr;
    const agRatioSourceChanged = saChanged || globulinChanged;

    if (!isNaN(sa) && !isNaN(globulin) && globulin !== 0) {
      updateCalculatedValue(
        ["ALB/GLB RATIO", "1005", "ALBUMIN / GLOBULIN RATIO", "ALBUMIN /GLOBULIN(A/G) RATIO", "A/G RATIO"],
        (sa / globulin).toFixed(2),
        agRatioSourceChanged
      );
    }

    // 3. BILIRUBIN (LFT)
    const tBiliStr = getTestValStr(["BILIRUBIN (TOTAL)", "BILI T", "TOTAL BILIRUBIN", "TBIL"]);
    const dBiliStr = getTestValStr(["BILIRUBIN (DIRECT)", "BILI", "DIRECT BILIRUBIN", "DBIL"]);

    const prevTBiliStr = getPrevValStr("tBili");
    const prevDBiliStr = getPrevValStr("dBili");

    const tBili = parseNum(tBiliStr);
    const dBili = parseNum(dBiliStr);

    const tBiliChanged = isNewTestSet ? false : tBiliStr !== prevTBiliStr;
    const dBiliChanged = isNewTestSet ? false : dBiliStr !== prevDBiliStr;
    const iBiliSourceChanged = tBiliChanged || dBiliChanged;

    // Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
    if (!isNaN(tBili) && !isNaN(dBili)) {
      const iBili = tBili - dBili;
      updateCalculatedValue(
        ["INDIRECT BILIRUBIN", "555", "BILIRUBIN (INDIRECT)", "IBIL"],
        iBili.toFixed(2),
        iBiliSourceChanged
      );
    }

    // 4. HbA1c -> Mean Blood Glucose Value (MBGV / eAG)
    const hba1cStr = getTestValStr(["HBA1C", "GLYCOSYLATED HEMOGLOBIN", "HB A1C"]);
    const prevHba1cStr = getPrevValStr("hba1c");
    const hba1c = parseNum(hba1cStr);
    const hba1cChanged = isNewTestSet ? false : hba1cStr !== prevHba1cStr;

    if (!isNaN(hba1c)) {
      const mbgv = 28.7 * hba1c - 46.7;
      updateCalculatedValue(
        ["Mean Blood Glucose Value", "MBGV", "MEAN BLOOD GLUCOSE", "EAG"],
        mbgv.toFixed(2),
        hba1cChanged
      );
    }

    // 5. CBC / HEMATOLOGY (Mentzer Index & RDWI)
    const mcvStr = getTestValStr(["MCV", "007"]);
    const rbcStr = getTestValStr(["RBC", "RBC (Red Blood Cells)", "RED BLOOD CELL COUNT (RBC)", "1010"]);
    const rdwCvStr = getTestValStr(["RDW-CV", "RDW"]);

    const prevMcvStr = getPrevValStr("mcv");
    const prevRbcStr = getPrevValStr("rbc");
    const prevRdwCvStr = getPrevValStr("rdwCv");

    const mcv = parseNum(mcvStr);
    const rbc = parseNum(rbcStr);
    const rdwCv = parseNum(rdwCvStr);

    const mcvChanged = isNewTestSet ? false : mcvStr !== prevMcvStr;
    const rbcChanged = isNewTestSet ? false : rbcStr !== prevRbcStr;
    const rdwCvChanged = isNewTestSet ? false : rdwCvStr !== prevRdwCvStr;

    if (!isNaN(mcv) && !isNaN(rbc) && rbc !== 0) {
      const mentzer = mcv / rbc;
      updateCalculatedValue(
        ["*Mentzr", "Mentzer Index", "MENTZER"],
        mentzer.toFixed(2),
        mcvChanged || rbcChanged
      );
    }

    if (!isNaN(mcv) && !isNaN(rdwCv) && !isNaN(rbc) && rbc !== 0) {
      const rdwi = (mcv * rdwCv) / rbc;
      updateCalculatedValue(
        ["*RDWI", "RDWI", "RDW Index"],
        rdwi.toFixed(2),
        mcvChanged || rdwCvChanged || rbcChanged
      );
    }

    // Update previous values ref with current state of inputs
    prevValuesRef.current = {
      tc: tcStr,
      tg: tgStr,
      hdl: hdlStr,
      ldl: getTestValStr(["LDL", "LDL CHOLESTEROL", "LDL (DIRECT)", "LDL (CALCULATED)"], newTests),
      tp: tpStr,
      sa: saStr,
      globulin: getTestValStr(["GLOBULIN", "1004", "SERUM GLOBULIN", "GLOB"], newTests),
      tBili: tBiliStr,
      dBili: dBiliStr,
      hba1c: hba1cStr,
      mcv: mcvStr,
      rbc: rbcStr,
      rdwCv: rdwCvStr,
    };

    if (isChanged) {
      onUpdateTests(newTests);
    }
  }, [tests, onUpdateTests]);
};

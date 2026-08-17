import { TestItemType } from "@/data/useGetTest";
import { PanelItemType } from "@/data/useGetPanels";

export function getFormattedInvestigationNames(
  t: {
    name?: any[];
    panels?: string[];
  },
  testsCatalog?: TestItemType[],
  panelsCatalog?: PanelItemType[]
): string[] {
  if (!t) return [];

  // 1. Collect ordered panel names from t.panels
  const rawPanels: string[] = (t.panels || [])
    .map((p: any) => (typeof p === "string" ? p : p?.name || String(p)))
    .filter(Boolean);

  const orderedPanels = Array.from(new Set(rawPanels));
  const panelNamesLower = new Set(orderedPanels.map((p) => p.toLowerCase()));

  // 2. Identify test IDs that belong to any of the ordered panels (using panelsCatalog if available)
  const panelTestIdsFromCatalog = new Set<string>();
  if (panelsCatalog && panelsCatalog.length > 0) {
    panelsCatalog.forEach((p) => {
      if (panelNamesLower.has(p.name.toLowerCase())) {
        (p.tests || []).forEach((testItem: any) => {
          const id = typeof testItem === "string" ? testItem : testItem?._id;
          if (id) panelTestIdsFromCatalog.add(String(id));
        });
      }
    });
  }

  // 3. Process individual tests in t.name
  const rawTests = Array.isArray(t.name) ? t.name : t.name ? [t.name] : [];
  const standaloneTestNames: string[] = [];

  rawTests.forEach((testObj: any) => {
    let id: string | null = null;
    let name: string | null = null;
    let testPanels: any[] = [];

    if (typeof testObj === "object" && testObj !== null) {
      id = testObj._id ? String(testObj._id) : null;
      name = testObj.name ? String(testObj.name) : null;
      testPanels = testObj.panels || [];
    } else if (typeof testObj === "string") {
      id = testObj;
      name = testObj;
    }

    // Try to find full test object from catalog if name is an ID or missing panel info
    if (testsCatalog && testsCatalog.length > 0) {
      const match = testsCatalog.find(
        (x) => String(x._id) === id || x.name === name
      );
      if (match) {
        id = String(match._id);
        name = match.name;
        if (match.panels) {
          testPanels = match.panels;
        }
      }
    }

    // Check if test is included in any ordered panel:
    let isIncludedInPanel = false;

    // A) ID matches a test inside an ordered panel in catalog
    if (id && panelTestIdsFromCatalog.has(id)) {
      isIncludedInPanel = true;
    }

    // B) testPanels array contains a panel name that is in orderedPanels
    if (!isIncludedInPanel && testPanels.length > 0) {
      isIncludedInPanel = testPanels.some((tp: any) => {
        const tpName = typeof tp === "string" ? tp : tp?.name;
        return tpName && panelNamesLower.has(String(tpName).toLowerCase());
      });
    }

    // C) Test name matches an ordered panel name
    if (!isIncludedInPanel && name && panelNamesLower.has(name.toLowerCase())) {
      isIncludedInPanel = true;
    }

    // If NOT included in any panel, add to standalone tests
    if (!isIncludedInPanel && name) {
      // Filter out raw 24-char ObjectId strings if name wasn't resolved
      const isHexId = /^[0-9a-fA-F]{24}$/.test(name);
      if (!isHexId) {
        if (!standaloneTestNames.includes(name)) {
          standaloneTestNames.push(name);
        }
      }
    }
  });

  return [...orderedPanels, ...standaloneTestNames];
}

export function getFormattedTherapyNames(
  therapyInput: any,
  therapyCatalog?: { _id: string; name: string }[]
): string {
  if (!therapyInput) return "";

  let list: any[] = [];
  if (Array.isArray(therapyInput)) {
    list = therapyInput;
  } else {
    list = [therapyInput];
  }

  const names: string[] = [];

  list.forEach((item) => {
    if (!item) return;

    if (typeof item === "object" && item !== null) {
      if (item.name) {
        names.push(item.name);
        return;
      }
      if (item._id) {
        item = String(item._id);
      }
    }

    if (typeof item === "string") {
      const str = item.trim();
      if (!str) return;

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(str);
      if (isObjectId) {
        if (therapyCatalog && therapyCatalog.length > 0) {
          const found = therapyCatalog.find((t) => String(t._id) === str);
          if (found && found.name) {
            names.push(found.name);
            return;
          }
        }
        return;
      }

      names.push(str);
    }
  });

  return names.join(", ");
}

export function getFormattedProcedureNames(
  procedureInput: any,
  procedureCatalog?: {
    _id: string;
    name: string;
    subProcedures?: { _id: string; name: string }[];
  }[]
): string {
  if (!procedureInput) return "";

  let list: any[] = [];
  if (Array.isArray(procedureInput)) {
    list = procedureInput;
  } else {
    list = [procedureInput];
  }

  const names: string[] = [];

  list.forEach((item) => {
    if (!item) return;

    if (typeof item === "object" && item !== null) {
      if (item.name) {
        if (item.parentName) {
          names.push(`${item.parentName} - ${item.name}`);
        } else {
          names.push(item.name);
        }
        return;
      }
      if (item._id) {
        item = String(item._id);
      }
    }

    if (typeof item === "string") {
      const str = item.trim();
      if (!str) return;

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(str);
      if (isObjectId && procedureCatalog && procedureCatalog.length > 0) {
        // Check sub-procedures first
        let found = false;
        for (const p of procedureCatalog) {
          const sub = (p.subProcedures || []).find((s) => String(s._id) === str);
          if (sub) {
            names.push(`${p.name} - ${sub.name}`);
            found = true;
            break;
          }
        }
        if (!found) {
          const mainProc = procedureCatalog.find((p) => String(p._id) === str);
          if (mainProc && mainProc.name) {
            names.push(mainProc.name);
            found = true;
          }
        }
        if (found) return;
      }

      names.push(str);
    }
  });

  return names.join(", ");
}


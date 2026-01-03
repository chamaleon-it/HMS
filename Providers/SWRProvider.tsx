"use client";

import api from "@/lib/axios";
import React from "react";
import { SWRConfig } from "swr";

// Cache version for schema compatibility
const CACHE_VERSION = "v1";
const DB_NAME = "swr-cache";


interface CacheDocument {
  _id: string;
  _rev?: string;
  data: any;
}

function pouchDBProvider() {

  const map = new Map();

  if (typeof window === "undefined") {
    return map;
  }

  const PouchDB = require("pouchdb-browser").default || require("pouchdb-browser");
  const PouchDBFind = require("pouchdb-find").default || require("pouchdb-find");
  PouchDB.plugin(PouchDBFind);

  let db: any = null;
  let isInitialized = false;

  const initDB = async () => {
    try {
      db = new PouchDB(DB_NAME);
      try {
        const versionDoc = await db.get("__version__");
        if (versionDoc.version !== CACHE_VERSION) {
          await db.destroy();
          db = new PouchDB(DB_NAME);
          await db.put({ _id: "__version__", version: CACHE_VERSION });
        }
      } catch (err) {
        await db.put({ _id: "__version__", version: CACHE_VERSION });
      }

      const result = await db.allDocs({ include_docs: true });
      result.rows.forEach((row: any) => {
        if (row.id !== "__version__" && row.doc) {
          try {
            map.set(row.id, row.doc.data);
          } catch (error) {
            console.error("Failed to load cache entry:", row.id, error);
          }
        }
      });

      isInitialized = true;
      console.log(`PouchDB cache loaded: ${map.size} entries`);
    } catch (error) {
      console.error("Failed to initialize PouchDB:", error);
    }
  };

  initDB();
  const saveCache = async () => {
    if (!db || !isInitialized) return;

    try {
      const entries = Array.from(map.entries());
      const bulkDocs: CacheDocument[] = [];

      for (const [key, value] of entries) {
        try {
          const existingDoc = await db.get(key).catch(() => null);

          bulkDocs.push({
            _id: key,
            _rev: existingDoc?._rev,
            data: value,
          });
        } catch (error) {
          console.error("Failed to prepare cache entry:", key, error);
        }
      }

      if (bulkDocs.length > 0) {
        await db.bulkDocs(bulkDocs);
      }
    } catch (error) {
      console.error("Failed to save cache to PouchDB:", error);
    }
  };

  window.addEventListener("beforeunload", () => {
    saveCache();
  });

  const saveInterval = setInterval(() => {
    saveCache();
  }, 30000);
  window.addEventListener("unload", () => {
    clearInterval(saveInterval);
  });

  return map;
}

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        provider: pouchDBProvider,
        fetcher: async (url: string) => {
          const res = await api.get(url);
          return res.data;
        },
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 3000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        refreshInterval: 0,
        suspense: false,
        onError: (err) => {
          console.error("SWR error:", err.message);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

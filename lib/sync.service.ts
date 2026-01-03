export type PendingAction = {
    _id: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    body: any;
    timestamp: number;
    module: string;
};

class SyncService {
    private dbCache: Map<string, any> = new Map();
    private pendingDb_internal: any = null;
    private PouchDB_ref: any = null;

    private async getPouchDB() {
        if (typeof window === 'undefined') return null;
        if (!this.PouchDB_ref) {
            const PouchDB = (await import('pouchdb-browser')).default;
            const PouchDBFind = (await import('pouchdb-find')).default;
            PouchDB.plugin(PouchDBFind);
            this.PouchDB_ref = PouchDB;
        }
        return this.PouchDB_ref;
    }

    private async getPendingDb() {
        if (typeof window === 'undefined') return null;
        if (!this.pendingDb_internal) {
            const PouchDB = await this.getPouchDB();
            if (PouchDB) {
                this.pendingDb_internal = new PouchDB('pending_actions');
            }
        }
        return this.pendingDb_internal;
    }

    async getDb<T extends {} = any>(collection: string): Promise<any> {
        if (typeof window === 'undefined') return null;
        if (!this.dbCache.has(collection)) {
            const PouchDB = await this.getPouchDB();
            if (PouchDB) {
                this.dbCache.set(collection, new PouchDB(collection));
            }
        }
        return this.dbCache.get(collection);
    }

    async getAll<T extends {} = any>(collection: string): Promise<T[]> {
        const db = await this.getDb<T>(collection);
        if (!db) return [];
        const result = await db.allDocs({ include_docs: true });
        return result.rows?.map((row: any) => row.doc as T);
    }

    async put<T extends {} = any>(collection: string, doc: T & { _id: string }): Promise<void> {
        const db = await this.getDb<T>(collection);
        if (!db) return;
        try {
            const existing = await db.get(doc._id);
            await db.put({ ...doc, _rev: existing._rev });
        } catch (e: any) {
            if (e.status === 404) {
                await db.put(doc);
            } else {
                throw e;
            }
        }
    }

    async queueAction(action: Omit<PendingAction, '_id' | 'timestamp'>): Promise<void> {
        // Exclude login requests from being queued
        if (action.url.includes('/auth/login') && action.method === 'POST') {
            return;
        }

        const db = await this.getPendingDb();
        if (!db) return;
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.put({
            ...action,
            _id: id,
            timestamp: Date.now()
        });
    }

    async getPendingActions(): Promise<PendingAction[]> {
        const db = await this.getPendingDb();
        if (!db) return [];
        const result = await db.allDocs({ include_docs: true });
        return result.rows
            ?.map((row: any) => row.doc as PendingAction)
            .sort((a: any, b: any) => a.timestamp - b.timestamp);
    }

    async removePendingAction(id: string): Promise<void> {
        const db = await this.getPendingDb();
        if (!db) return;
        const doc = await db.get(id);
        await db.remove(doc);
    }

    async bulkUpdate<T extends {} = any>(collection: string, docs: T[]): Promise<void> {
        const db = await this.getDb<T>(collection);
        if (!db) return;
        const existing = await db.allDocs({ include_docs: false });
        const revMap = new Map(existing.rows?.map((row: any) => [row.id, row.value.rev]));

        const bulkDocs = docs?.map((doc: any) => {
            const _id = doc._id || doc.id;
            if (!_id) return doc;
            const _rev = revMap.get(_id);
            return { ...doc, _id, _rev };
        });

        await db.bulkDocs(bulkDocs);
    }

    async find<T extends {} = any>(collection: string, query: any): Promise<T[]> {
        const db = await this.getDb<T>(collection);
        if (!db) return [];
        const result = await db.find(query);
        return result.docs as T[];
    }

    async clearCollection(collection: string): Promise<void> {
        const db = await this.getDb(collection);
        if (!db) return;
        const result = await db.allDocs();
        const deletions = result.rows?.map((row: any) => ({
            _id: row.id,
            _rev: row.value.rev,
            _deleted: true
        }));
        await db.bulkDocs(deletions);
    }
}

export const syncService = new SyncService();

import Dexie, { type Table } from 'dexie';

export interface HistoryItem {
  id?: number;
  fileName: string;
  fileSize: number;
  toolName: string;
  toolPath: string;
  timestamp: number;
}

export interface DraftItem {
  id?: number;
  fileName: string;
  toolSlug: string;
  data: any; // Can be canvas JSON, extracted text, etc.
  updatedAt: number;
}

export interface SignatureItem {
  id?: number;
  name: string;
  dataUrl: string;
  type: 'draw' | 'type' | 'upload';
  createdAt: number;
}

export class VvDatabase extends Dexie {
  history!: Table<HistoryItem>;
  drafts!: Table<DraftItem>;
  signatures!: Table<SignatureItem>;

  constructor() {
    super('VvDatabase');
    this.version(2).stores({
      history: '++id, toolName, timestamp',
      drafts: '++id, toolSlug, updatedAt',
      signatures: '++id, name, createdAt'
    });
  }
}

export const db = new VvDatabase();

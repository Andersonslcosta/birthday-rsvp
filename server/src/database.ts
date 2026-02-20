import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/birthday.db');

export interface Participant {
  name: string;
  age: number | null;
  isChild: boolean;
}

export interface RSVP {
  id: string;
  responsibleName: string;
  confirmation: 'sim' | 'nao';
  totalPeople: number;
  participants: Participant[];
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalGuests: number;
  confirmed: number;
  declined: number;
  totalConfirmed: number;
  adults: number;
  children: number;
}

let db: sqlite3.Database;

export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de RSVPs
      db.run(
        `CREATE TABLE IF NOT EXISTS rsvps (
          id TEXT PRIMARY KEY,
          responsibleName TEXT NOT NULL,
          confirmation TEXT NOT NULL CHECK (confirmation IN ('sim', 'nao')),
          totalPeople INTEGER NOT NULL DEFAULT 0,
          participantsData TEXT NOT NULL DEFAULT '[]',
          timestamp TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Tabela de Admin para histórico de acessos
      db.run(
        `CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          details TEXT
        )`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

export function saveRSVP(rsvp: Omit<RSVP, 'id' | 'createdAt' | 'updatedAt'>): Promise<RSVP> {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const participantsData = JSON.stringify(rsvp.participants);

    db.run(
      `INSERT INTO rsvps (id, responsibleName, confirmation, totalPeople, participantsData, timestamp, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        rsvp.responsibleName,
        rsvp.confirmation,
        rsvp.totalPeople,
        participantsData,
        rsvp.timestamp,
        now,
        now,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            ...rsvp,
            id,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    );
  });
}

export function getAllRSVPs(): Promise<RSVP[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM rsvps ORDER BY createdAt DESC`,
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const rsvps = rows.map((row) => ({
            id: row.id,
            responsibleName: row.responsibleName,
            confirmation: row.confirmation,
            totalPeople: row.totalPeople,
            participants: JSON.parse(row.participantsData),
            timestamp: row.timestamp,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          }));
          resolve(rsvps);
        }
      }
    );
  });
}

export function geStatistics(): Promise<Statistics> {
  return new Promise((resolve, reject) => {
    getAllRSVPs()
      .then((rsvps) => {
        const confirmed = rsvps.filter((r) => r.confirmation === 'sim');
        const declined = rsvps.filter((r) => r.confirmation === 'nao');

        let totalConfirmed = 0;
        let adults = 0;
        let children = 0;

        confirmed.forEach((rsvp) => {
          totalConfirmed += rsvp.totalPeople;
          rsvp.participants.forEach((p) => {
            if (p.isChild) {
              children++;
            } else {
              adults++;
            }
          });
        });

        resolve({
          totalGuests: rsvps.length,
          confirmed: confirmed.length,
          declined: declined.length,
          totalConfirmed,
          adults,
          children,
        });
      })
      .catch(reject);
  });
}

export function deleteAllRSVPs(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM rsvps', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function logAdminAction(action: string, details?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    db.run(
      `INSERT INTO admin_logs (action, timestamp, details) VALUES (?, ?, ?)`,
      [action, timestamp, details || null],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

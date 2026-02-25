import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use absolute path for Database - resolve to project root's data directory
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../data/birthday.db');
// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`[Database] Created directory: ${dataDir}`);
}
let db;
export function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                createTables().then(resolve).catch(reject);
            }
        });
    });
}
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabela de RSVPs
            db.run(`CREATE TABLE IF NOT EXISTS rsvps (
          id TEXT PRIMARY KEY,
          responsibleName TEXT NOT NULL,
          confirmation TEXT NOT NULL CHECK (confirmation IN ('sim', 'nao')),
          totalPeople INTEGER NOT NULL DEFAULT 0,
          participantsData TEXT NOT NULL DEFAULT '[]',
          timestamp TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )`, (err) => {
                if (err)
                    reject(err);
            });
            // Tabela de Admin para histórico de acessos
            db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          details TEXT
        )`, (err) => {
                if (err)
                    reject(err);
            });
            // Tabela de tokens de reset de senha
            db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL
        )`, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    });
}
export function saveRSVP(rsvp) {
    return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const participantsData = JSON.stringify(rsvp.participants);
        db.run(`INSERT INTO rsvps (id, responsibleName, confirmation, totalPeople, participantsData, timestamp, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            rsvp.responsibleName,
            rsvp.confirmation,
            rsvp.totalPeople,
            participantsData,
            rsvp.timestamp,
            now,
            now,
        ], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({
                    ...rsvp,
                    id,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        });
    });
}
export function getAllRSVPs() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM rsvps ORDER BY createdAt DESC`, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
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
        });
    });
}
export function getStatistics() {
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
                    }
                    else {
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
export function deleteAllRSVPs() {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM rsvps', (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export function deleteRSVPById(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM rsvps WHERE id = ?', [id], function (err) {
            if (err) {
                reject(err);
            }
            else if (this.changes === 0) {
                reject(new Error('RSVP não encontrado'));
            }
            else {
                resolve();
            }
        });
    });
}
export function deleteParticipant(rsvpId, participantName) {
    return new Promise((resolve, reject) => {
        // First, get the current RSVP
        db.get('SELECT * FROM rsvps WHERE id = ?', [rsvpId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (!row) {
                reject(new Error('RSVP não encontrado'));
                return;
            }
            if (!row.participantsData) {
                reject(new Error('Dados de participantes inválidos'));
                return;
            }
            let participants;
            try {
                participants = JSON.parse(row.participantsData);
            }
            catch (parseError) {
                reject(new Error('Erro ao processar dados de participantes'));
                return;
            }
            const normalizedSearchName = participantName.trim().toLowerCase();
            const filteredParticipants = participants.filter((p) => p.name.trim().toLowerCase() !== normalizedSearchName);
            // If no participants left, delete the entire RSVP
            if (filteredParticipants.length === 0) {
                db.run('DELETE FROM rsvps WHERE id = ?', [rsvpId], function (deleteErr) {
                    if (deleteErr) {
                        reject(deleteErr);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                // Update with remaining participants
                const newTotalPeople = filteredParticipants.length;
                db.run('UPDATE rsvps SET participantsData = ?, totalPeople = ? WHERE id = ?', [JSON.stringify(filteredParticipants), newTotalPeople, rsvpId], function (updateErr) {
                    if (updateErr) {
                        reject(updateErr);
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    });
}
export function logAdminAction(action, details) {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString();
        db.run(`INSERT INTO admin_logs (action, timestamp, details) VALUES (?, ?, ?)`, [action, timestamp, details || null], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
// Password Reset Token Management
export function createResetToken(email, token, expiresInMinutes = 30) {
    return new Promise((resolve, reject) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInMinutes * 60000).toISOString();
        const createdAt = now.toISOString();
        db.run(`INSERT INTO password_reset_tokens (token, email, expiresAt, createdAt) VALUES (?, ?, ?, ?)`, [token, email, expiresAt, createdAt], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export function validateResetToken(token) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0`, [token], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (!row) {
                resolve({ valid: false });
                return;
            }
            const now = new Date();
            const expiresAt = new Date(row.expiresAt);
            if (now > expiresAt) {
                resolve({ valid: false });
                return;
            }
            resolve({ valid: true, email: row.email });
        });
    });
}
export function markTokenAsUsed(token) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE password_reset_tokens SET used = 1 WHERE token = ?`, [token], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export function cleanupExpiredTokens() {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db.run(`DELETE FROM password_reset_tokens WHERE expiresAt < ? OR used = 1`, [now], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
//# sourceMappingURL=database.js.map
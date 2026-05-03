import { createPool } from 'mariadb';
import type { Connection } from 'mariadb';
import { env } from '../config/env.js';

/** Shape of the result returned by INSERT / UPDATE / DELETE queries. */
export interface UpsertResult {
  affectedRows: number;
  insertId: number | bigint;
  warningStatus: number;
}

// ─── Connection pool ──────────────────────────────────────────────────────────
// multipleStatements: false — prevents stacked-query SQL injection vectors.
// charset utf8mb4        — full Unicode support (emoji, CJK, etc.).
const pool = createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  charset: 'utf8mb4',
  timezone: 'UTC',
  multipleStatements: false,   // ← SECURITY: blocks stacked queries
  insertIdAsNumber: true,
  bigIntAsNumber: true,
  autoJsonMap: false,          // ← Return JSON_ARRAYAGG results as strings, not pre-parsed objects
});

// ─── Database façade ──────────────────────────────────────────────────────────
export const db = {
  /**
   * Execute a single parameterized query.
   * Never build the `sql` string from user input — use `params` for that.
   */
  async query<T = UpsertResult>(
    sql: string,
    params?: unknown[],
  ): Promise<T> {
    const conn = await pool.getConnection();
    try {
      return (await conn.query(sql, params)) as T;
    } finally {
      conn.release();
    }
  },

  /**
   * Execute a set of queries inside a single transaction.
   * Rolls back automatically on any thrown error.
   */
  async transaction<T>(
    callback: (conn: Connection) => Promise<T>,
  ): Promise<T> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await callback(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /** Gracefully drain and close all pool connections. */
  async close(): Promise<void> {
    await pool.end();
  },
};

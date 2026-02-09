import mysql from 'mysql2/promise';

let pool = null;
const ENABLE_LOGGING = process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development';

function logQuery(sql, params, result) {
  if (!ENABLE_LOGGING) return;

  const operation = sql.trim().split(/\s+/)[0].toUpperCase();
  const table = extractTableName(sql);

  let info = `[DB] ${operation} ${table}`;

  if (operation === 'INSERT' && result?.insertId) {
    info += ` → id: ${result.insertId}`;
  } else if (operation === 'UPDATE' || operation === 'DELETE') {
    info += ` → affected: ${result?.affectedRows || 0}`;
  } else if (operation === 'SELECT') {
    const rows = Array.isArray(result) ? result.length : (result ? 1 : 0);
    info += ` → rows: ${rows}`;
  }

  console.log(info);
}

function extractTableName(sql) {
  const normalized = sql.replace(/\s+/g, ' ').toLowerCase();
  let match;

  if ((match = normalized.match(/from\s+(\w+)/))) return match[1];
  if ((match = normalized.match(/into\s+(\w+)/))) return match[1];
  if ((match = normalized.match(/update\s+(\w+)/))) return match[1];
  if ((match = normalized.match(/delete\s+from\s+(\w+)/))) return match[1];

  return '?';
}

export async function initDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'photo_framer',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  // Test connection
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows, fields] = await getPool().execute(sql, params);

  // For INSERT/UPDATE/DELETE, rows contains ResultSetHeader with affectedRows, insertId
  // For SELECT, rows is an array of results
  const isModify = /^\s*(INSERT|UPDATE|DELETE)/i.test(sql);
  logQuery(sql, params, isModify ? rows : rows);

  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

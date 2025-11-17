import mysql, { Pool, PoolConnection } from 'mysql2/promise';

/**
 * ============================================================================
 * MySQL Database Connection Module
 * ============================================================================
 * 
 * Secure database connection handler for MySQL.
 * Uses globalThis to persist pool across Next.js hot-reloads.
 * 
 * SECURITY NOTES:
 * - All credentials MUST come from environment variables
 * - NO hardcoded passwords or credentials
 * - Passwords are NEVER logged or exposed
 * - .env.local is in .gitignore (never committed)
 * 
 * Required Environment Variables:
 * - MYSQL_HOST: Database host (default: localhost)
 * - MYSQL_PORT: Database port (default: 3306)
 * - MYSQL_USER: Database username (REQUIRED)
 * - MYSQL_PASSWORD: Database password (REQUIRED)
 * - MYSQL_DATABASE: Database name (REQUIRED)
 * - MYSQL_POOL_LIMIT: Connection pool limit (default: 15)
 * - MYSQL_SSL: Enable SSL (optional, default: false)
 * 
 * ============================================================================
 */

// ============================================================================
// Global Pool (Next.js hot-reload safe)
// ============================================================================

type GlobalPools = typeof globalThis & { __uniti_mysql_pool?: Pool };

const g = globalThis as GlobalPools;

if (!g.__uniti_mysql_pool) {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  // Validate required environment variables
  if (!user) {
    throw new Error(
      'MYSQL_USER environment variable is required. ' +
      'Please set it in your .env.local file.'
    );
  }

  if (!password) {
    throw new Error(
      'MYSQL_PASSWORD environment variable is required. ' +
      'Please set it in your .env.local file.'
    );
  }

  if (!database) {
    throw new Error(
      'MYSQL_DATABASE environment variable is required. ' +
      'Please set it in your .env.local file.'
    );
  }

  const connectionLimit = Number(process.env.MYSQL_POOL_LIMIT ?? 15);

  g.__uniti_mysql_pool = mysql.createPool({
    host,
    port,
    user,
    password, // Never log or expose this
    database,
    waitForConnections: true, // queue instead of throwing
    connectionLimit: connectionLimit > 0 ? connectionLimit : 15,
    queueLimit: 0, // unlimited queue
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // SSL configuration (optional, for production)
    ...(process.env.MYSQL_SSL === 'true' && {
      ssl: {
        rejectUnauthorized: false
      }
    })
  });
}

// Reused across hot reloads
export const pool = g.__uniti_mysql_pool;

// ============================================================================
// Simple Query Helpers (use these in most places)
// ============================================================================

/**
 * Execute a query - automatically manages connection
 * Use this for most queries (no transaction needed)
 * 
 * @template T - Type of the result rows
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns Promise resolving to array of result rows
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/**
 * Execute a query that returns a single row
 * Returns null if no rows found
 * 
 * @template T - Type of the result row
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns Promise resolving to single result row or null
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// ============================================================================
// Transaction Helper (guarantees release)
// ============================================================================

/**
 * Execute a database transaction
 * Automatically handles commit/rollback and connection release
 * 
 * @template T - Return type of the callback
 * @param fn - Function to execute within transaction
 * @returns Promise resolving to callback result
 * @throws Error if transaction fails (automatic rollback)
 */
export async function transaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      // Ignore rollback errors
    }
    throw e;
  } finally {
    conn.release(); // <- critical: always release
  }
}

// ============================================================================
// Raw Connection Helper (rare use cases)
// ============================================================================

/**
 * Get a raw connection - ALWAYS release in finally
 * Only use if you need a connection for multiple operations
 * Prefer query() or transaction() when possible
 * 
 * @template T - Return type of the callback
 * @param fn - Function to execute with connection
 * @returns Promise resolving to callback result
 */
export async function withConnection<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release(); // <- critical: always release
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Close the connection pool
 * Useful for cleanup in tests or graceful shutdown
 * Only call on process exit, never in request handlers
 * 
 * @returns Promise that resolves when pool is closed
 */
export async function closePool(): Promise<void> {
  if (g.__uniti_mysql_pool) {
    await g.__uniti_mysql_pool.end();
    g.__uniti_mysql_pool = undefined;
  }
}

/**
 * Test database connection
 * Performs a simple query to verify connectivity
 * 
 * @returns Promise resolving to true if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error: any) {
    // Log error without exposing sensitive information
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'UNKNOWN';
    
    console.error('MySQL connection test failed:', {
      code: errorCode,
      message: errorMessage,
      // Never log password or sensitive connection details
      host: process.env.MYSQL_HOST || 'localhost',
      database: process.env.MYSQL_DATABASE || 'not set',
      user: process.env.MYSQL_USER || 'not set'
    });
    
    return false;
  }
}

// ============================================================================
// Legacy exports (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use pool directly or query() instead
 * Get MySQL connection pool
 */
export function getPool(): Pool {
  return pool;
}

/**
 * @deprecated Use query() or withConnection() instead
 * Get a connection from the pool - MUST release in finally
 */
export async function getConnection(): Promise<PoolConnection> {
  return await pool.getConnection();
}

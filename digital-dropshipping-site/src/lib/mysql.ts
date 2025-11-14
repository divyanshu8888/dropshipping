import mysql from 'mysql2/promise';
import type { PoolConnection } from 'mysql2/promise';

/**
 * ============================================================================
 * MySQL Database Connection Module
 * ============================================================================
 * 
 * Secure database connection handler for MySQL.
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
 * - MYSQL_SSL: Enable SSL (optional, default: false)
 * 
 * ============================================================================
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get MySQL configuration from environment variables
 * 
 * @throws Error if required environment variables are missing
 * @returns MySQL pool configuration options
 */
function getMySQLConfig(): mysql.PoolOptions {
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

  const connectionLimit = parseInt(process.env.MYSQL_POOL_LIMIT || '5', 10);
  const connectTimeout = parseInt(process.env.MYSQL_CONNECT_TIMEOUT || '2000', 10);

  return {
    host,
    port,
    user,
    password, // Never log or expose this
    database,
    waitForConnections: true,
    connectionLimit: Number.isFinite(connectionLimit) && connectionLimit > 0 ? connectionLimit : 5,
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0,
    connectTimeout: Number.isFinite(connectTimeout) ? connectTimeout : 2000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // SSL configuration (optional, for production)
    ...(process.env.MYSQL_SSL === 'true' && {
      ssl: {
        rejectUnauthorized: false
      }
    })
  };
}

// ============================================================================
// Connection Pool Management
// ============================================================================

/**
 * Connection pool instance
 * Lazy-initialized singleton pattern
 */
let pool: mysql.Pool | null = null;

/**
 * Get MySQL connection pool
 * Creates a new pool if it doesn't exist (singleton pattern)
 * 
 * @throws Error if required environment variables are missing
 * @returns MySQL connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getMySQLConfig();
    pool = mysql.createPool(config);
  }
  return pool;
}

/**
 * Get a connection from the pool
 * 
 * @returns Promise resolving to a MySQL pool connection
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool();
  return await pool.getConnection();
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Execute a query with automatic connection management
 * 
 * @template T - Type of the result rows
 * @param sql - SQL query string
 * @param params - Query parameters (optional)
 * @returns Promise resolving to array of result rows
 */
const MYSQL_QUERY_TIMEOUT = parseInt(process.env.MYSQL_QUERY_TIMEOUT || '2000', 10);

async function executeWithTimeout<T>(
  connection: PoolConnection,
  sql: string,
  params?: any[]
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let timedOut = false;

  const execution = connection.execute(sql, params) as Promise<T>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timedOut = true;
      reject(new Error(`Query timeout after ${MYSQL_QUERY_TIMEOUT}ms for: ${sql.slice(0, 60)}...`));
    }, MYSQL_QUERY_TIMEOUT);
  });

  try {
    const result = await Promise.race([execution, timeoutPromise]);
    return result as T;
  } catch (error) {
    if (timedOut) {
      connection.destroy();
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!timedOut) {
      connection.release();
    }
  }
}

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getConnection();
  const result = await executeWithTimeout<any>(connection, sql, params);
  const [rows] = result;
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
// Transaction Support
// ============================================================================

/**
 * Execute a database transaction
 * Automatically handles commit/rollback
 * 
 * @template T - Return type of the callback
 * @param callback - Function to execute within transaction
 * @returns Promise resolving to callback result
 * @throws Error if transaction fails (automatic rollback)
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Close the connection pool
 * Useful for cleanup in tests or graceful shutdown
 * 
 * @returns Promise that resolves when pool is closed
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
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
    const connection = await getConnection();
    await connection.execute('SELECT 1');
    connection.release();
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
// Exports
// ============================================================================

/**
 * Export pool for direct access if needed (advanced use cases)
 * Prefer using getPool() instead
 */
export { pool };


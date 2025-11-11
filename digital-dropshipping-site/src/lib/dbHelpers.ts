import { query } from './mysql';

type MySqlError = {
  code?: string;
  [key: string]: any;
};

function logError(error: MySqlError, context?: string) {
  const prefix = context ? `[${context}] ` : '';

  if (error?.code === 'ER_NO_SUCH_TABLE') {
    console.warn(`${prefix}Table missing:`, error?.sqlMessage || error?.message || error);
    return;
  }

  if (error?.code === 'ER_BAD_FIELD_ERROR') {
    console.warn(`${prefix}Column missing:`, error?.sqlMessage || error?.message || error);
    return;
  }

  console.error(`${prefix}Database error:`, error);
}

export async function safeQuery<T = any>(
  sql: string,
  params: any[] = [],
  context?: string
): Promise<T[]> {
  try {
    return await query<T>(sql, params);
  } catch (error: any) {
    logError(error, context);
    return [];
  }
}

export async function safeExecute(
  sql: string,
  params: any[] = [],
  context?: string
): Promise<boolean> {
  try {
    await query(sql, params);
    return true;
  } catch (error: any) {
    logError(error, context);
    return false;
  }
}

export async function safeCount(
  table: string,
  whereClause: string = '',
  params: any[] = [],
  context?: string
): Promise<number> {
  const effectiveContext = context ?? `count:${table}`;
  if (!(await tableExists(table))) {
    return 0;
  }
  const rows = await safeQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`,
    params,
    effectiveContext
  );
  return rows[0]?.count ?? 0;
}

export async function safeSum(
  table: string,
  column: string,
  whereClause: string = '',
  params: any[] = [],
  context?: string
): Promise<number> {
  const effectiveContext = context ?? `sum:${table}.${column}`;
  if (!(await tableExists(table))) {
    return 0;
  }
  const rows = await safeQuery<{ total: number }>(
    `SELECT COALESCE(SUM(${column}), 0) as total FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`,
    params,
    effectiveContext
  );

  return Number(rows[0]?.total ?? 0);
}

type TableCacheState = {
  tables: Set<string>;
  refreshedAt: number;
  ttl: number;
  unhealthyUntil?: number;
};

const TABLE_CACHE_TTL = 60 * 1000;
const TABLE_CACHE_ERROR_COOLDOWN = 10 * 1000;

let tableCacheState: TableCacheState | null = null;

async function refreshTableCache(): Promise<Set<string>> {
  const now = Date.now();
  if (tableCacheState?.unhealthyUntil && now < tableCacheState.unhealthyUntil) {
    return tableCacheState.tables;
  }

  if (tableCacheState && now - tableCacheState.refreshedAt < tableCacheState.ttl) {
    return tableCacheState.tables;
  }

  try {
    const rows = await query<{ table_name?: string; TABLE_NAME?: string }>(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = DATABASE()`
    );

    const tables = new Set(
      rows
        .map((row) => row.table_name ?? row.TABLE_NAME ?? '')
        .filter((name) => typeof name === 'string' && name.length > 0)
        .map((name) => name.toLowerCase())
    );
    tableCacheState = {
      tables,
      refreshedAt: now,
      ttl: TABLE_CACHE_TTL
    };
    return tables;
  } catch (error: any) {
    logError(error, 'table-list');
    const cooldownUntil = now + TABLE_CACHE_ERROR_COOLDOWN;
    tableCacheState = {
      tables: tableCacheState?.tables ?? new Set(),
      refreshedAt: tableCacheState?.refreshedAt ?? 0,
      ttl: TABLE_CACHE_TTL,
      unhealthyUntil: cooldownUntil
    };
    return tableCacheState.tables;
  }
}

export async function tableExists(table: string): Promise<boolean> {
  const tableName = table.toLowerCase();
  const tables = await refreshTableCache();

  if (tables.size === 0 && tableCacheState?.unhealthyUntil && Date.now() < tableCacheState.unhealthyUntil) {
    return false;
  }

  if (!tables.has(tableName)) {
    const refreshedTables = await refreshTableCache();
    return refreshedTables.has(tableName);
  }

  return true;
}

export function clearTableExistsCache() {
  tableCacheState = null;
}



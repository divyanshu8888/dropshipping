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
  const rows = await safeQuery<{ total: number }>(
    `SELECT COALESCE(SUM(${column}), 0) as total FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`,
    params,
    effectiveContext
  );

  return Number(rows[0]?.total ?? 0);
}



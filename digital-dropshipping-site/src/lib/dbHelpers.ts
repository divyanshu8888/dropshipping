import { query } from './mysql';

type MySqlError = {
  code?: string;
  [key: string]: any;
};

function logError(error: MySqlError, context?: string) {
  if (error?.code === 'ER_NO_SUCH_TABLE') {
    const prefix = context ? `[${context}] ` : '';
    console.warn(`${prefix}Table missing:`, error?.sqlMessage || error?.message || error);
    return;
  }

  const prefix = context ? `[${context}] ` : '';
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
  const rows = await safeQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`,
    params,
    context
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
  const rows = await safeQuery<{ total: number }>(
    `SELECT COALESCE(SUM(${column}), 0) as total FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`,
    params,
    context
  );

  return Number(rows[0]?.total ?? 0);
}



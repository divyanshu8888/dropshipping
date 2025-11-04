import { NextApiRequest, NextApiResponse } from 'next';
import { testConnection, query } from '../../src/lib/mysql';

/**
 * API endpoint to test MySQL database connection
 * GET /api/test-db
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(500).json({ 
        error: 'Database connection failed',
        connected: false 
      });
    }

    // Test query - get table count
    const tables = await query<{ name: string }>(
      `SELECT TABLE_NAME as name 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [process.env.MYSQL_DATABASE || 'uniti']
    );

    // Test query - get users count
    const usersCount = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    return res.status(200).json({
      connected: true,
      message: 'Database connection successful',
      database: process.env.MYSQL_DATABASE || 'uniti',
      tablesCount: tables.length,
      usersCount: usersCount[0]?.count || 0,
      tables: tables.map(t => t.name)
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return res.status(500).json({
      error: 'Database test failed',
      message: error.message,
      connected: false
    });
  }
}


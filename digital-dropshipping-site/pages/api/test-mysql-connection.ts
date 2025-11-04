import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

/**
 * API endpoint to test MySQL connection with current credentials
 * GET /api/test-mysql-connection
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get configuration - no hardcoded passwords
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  // Validate required environment variables
  if (!user || !password || !database) {
    return res.status(400).json({
      success: false,
      error: 'Missing required MySQL environment variables',
      required: ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'],
      message: 'Please set all required MySQL environment variables in .env.local'
    });
  }

  const config = {
    host,
    port,
    user,
    password, // Never expose in logs or responses
    database,
  };

  let connection: mysql.Connection | null = null;

  try {
    // Try to connect
    connection = await mysql.createConnection(config);
    
    // Test query
    const [rows] = await connection.execute('SELECT DATABASE() as db, USER() as user, VERSION() as version');
    
    // Get table count
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [config.database]);

    await connection.end();

    return res.status(200).json({
      success: true,
      message: 'MySQL connection successful!',
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database,
        password: '***HIDDEN***' // Never expose password
      },
      connection: rows,
      tables: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (connection) {
      await connection.end().catch(() => {});
    }

    console.error('MySQL connection test error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      config: {
        host: config.host || 'not set',
        port: config.port || 'not set',
        user: config.user || 'not set',
        database: config.database || 'not set',
        password: '***HIDDEN***' // Never expose password
      },
      troubleshooting: {
        step1: 'Check if MySQL server is running',
        step2: 'Verify username and password in .env.local',
        step3: 'Ensure user has privileges: GRANT ALL ON uniti.* TO \'uniti\'@\'localhost\';',
        step4: 'Check if database exists: SHOW DATABASES LIKE \'uniti\';'
      }
    });
  }
}


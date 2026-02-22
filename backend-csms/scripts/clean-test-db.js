const { Client } = require('pg');
const config = require('../src/config/database');

async function cleanDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'test',
    password: process.env.DB_PASSWORD || 'test',
    database: process.env.DB_DATABASE || 'test_db'
  });

  try {
    await client.connect();
    console.log('Connected to test database');

    // Obtener todas las tablas
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    // Desactivar triggers y eliminar datos
    await client.query('SET session_replication_role = replica;');

    // Eliminar datos de todas las tablas
    for (const table of tables.rows) {
      await client.query(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
      console.log(`Cleaned table: ${table.tablename}`);
    }

    // Reactivar triggers
    await client.query('SET session_replication_role = DEFAULT;');

    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDatabase(); 
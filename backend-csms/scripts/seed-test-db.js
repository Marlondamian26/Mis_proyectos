const { Client } = require('pg');
const config = require('../src/config/database');

async function seedDatabase() {
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

    // Datos de prueba para conductores
    await client.query(`
      INSERT INTO conductores (nombre, apellido, email, password, estado)
      VALUES 
        ('Test', 'Driver', 'test.driver@example.com', '$2b$10$test', 'ACTIVO'),
        ('Admin', 'User', 'admin@example.com', '$2b$10$test', 'ACTIVO')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Datos de prueba para tarifas
    await client.query(`
      INSERT INTO tarifas (tipo_conector, precio_kwh, hora_inicio, hora_fin, moneda)
      VALUES 
        ('CCS', 0.50, '08:00', '18:00', 'USD'),
        ('CHAdeMO', 0.45, '08:00', '18:00', 'USD')
      ON CONFLICT (tipo_conector) DO NOTHING;
    `);

    // Datos de prueba para facturas
    await client.query(`
      INSERT INTO facturas (numero_factura, fecha_emision, fecha_vencimiento, monto_total, estado, concepto, cliente_id)
      VALUES 
        ('F001-001', NOW(), NOW() + INTERVAL '30 days', 1500.00, 'PENDIENTE', 'Servicio de carga', '1'),
        ('F001-002', NOW(), NOW() + INTERVAL '30 days', 2000.00, 'PAGADA', 'Servicio de carga', '1')
      ON CONFLICT (numero_factura) DO NOTHING;
    `);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase(); 
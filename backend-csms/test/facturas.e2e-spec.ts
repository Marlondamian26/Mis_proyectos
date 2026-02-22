import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasModule } from '../src/facturas/facturas.module';
import { Factura } from '../src/facturas/entities/factura.entity';

describe('FacturasController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [Factura],
          synchronize: true,
        }),
        FacturasModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdFacturaId: string;

  describe('/facturas (POST)', () => {
    it('should create a new factura', () => {
      return request(app.getHttpServer())
        .post('/facturas')
        .send({
          numero_factura: 'F001-001',
          fecha_emision: new Date().toISOString(),
          fecha_vencimiento: new Date().toISOString(),
          monto_total: 1500.00,
          estado: 'PENDIENTE',
          concepto: 'Servicio de carga',
          cliente_id: '1',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.numero_factura).toBe('F001-001');
          expect(res.body.monto_total).toBe(1500.00);
          createdFacturaId = res.body.id;
        });
    });
  });

  describe('/facturas (GET)', () => {
    it('should return all facturas', () => {
      return request(app.getHttpServer())
        .get('/facturas')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/facturas/:id (GET)', () => {
    it('should return a specific factura', () => {
      return request(app.getHttpServer())
        .get(`/facturas/${createdFacturaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdFacturaId);
          expect(res.body.numero_factura).toBe('F001-001');
        });
    });

    it('should return 404 for non-existent factura', () => {
      return request(app.getHttpServer())
        .get('/facturas/non-existent-id')
        .expect(404);
    });
  });

  describe('/facturas/:id (PATCH)', () => {
    it('should update a factura', () => {
      return request(app.getHttpServer())
        .patch(`/facturas/${createdFacturaId}`)
        .send({
          estado: 'PAGADA',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdFacturaId);
          expect(res.body.estado).toBe('PAGADA');
        });
    });

    it('should return 404 when updating non-existent factura', () => {
      return request(app.getHttpServer())
        .patch('/facturas/non-existent-id')
        .send({
          estado: 'PAGADA',
        })
        .expect(404);
    });
  });

  describe('/facturas/:id/historial (GET)', () => {
    it('should return factura history', () => {
      return request(app.getHttpServer())
        .get(`/facturas/${createdFacturaId}/historial`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent factura history', () => {
      return request(app.getHttpServer())
        .get('/facturas/non-existent-id/historial')
        .expect(404);
    });
  });

  describe('/facturas/:id (DELETE)', () => {
    it('should soft delete a factura', () => {
      return request(app.getHttpServer())
        .delete(`/facturas/${createdFacturaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdFacturaId);
          expect(res.body.deletedAt).toBeDefined();
        });
    });

    it('should return 404 when deleting non-existent factura', () => {
      return request(app.getHttpServer())
        .delete('/facturas/non-existent-id')
        .expect(404);
    });
  });
}); 
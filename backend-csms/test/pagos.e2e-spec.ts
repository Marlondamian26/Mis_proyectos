import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosModule } from '../src/pagos/pagos.module';
import { Pago } from '../src/pagos/entities/pago.entity';

describe('PagosController (e2e)', () => {
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
          entities: [Pago],
          synchronize: true,
        }),
        PagosModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdPagoId: string;

  describe('/pagos (POST)', () => {
    it('should create a new pago', () => {
      return request(app.getHttpServer())
        .post('/pagos')
        .send({
          monto: 100.50,
          metodo_pago: 'TARJETA',
          estado: 'PENDIENTE',
          fecha_pago: new Date().toISOString(),
          referencia: 'REF123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.monto).toBe(100.50);
          expect(res.body.metodo_pago).toBe('TARJETA');
          createdPagoId = res.body.id;
        });
    });
  });

  describe('/pagos (GET)', () => {
    it('should return all pagos', () => {
      return request(app.getHttpServer())
        .get('/pagos')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/pagos/:id (GET)', () => {
    it('should return a specific pago', () => {
      return request(app.getHttpServer())
        .get(`/pagos/${createdPagoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPagoId);
          expect(res.body.metodo_pago).toBe('TARJETA');
        });
    });

    it('should return 404 for non-existent pago', () => {
      return request(app.getHttpServer())
        .get('/pagos/non-existent-id')
        .expect(404);
    });
  });

  describe('/pagos/:id (PATCH)', () => {
    it('should update a pago', () => {
      return request(app.getHttpServer())
        .patch(`/pagos/${createdPagoId}`)
        .send({
          estado: 'COMPLETADO',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPagoId);
          expect(res.body.estado).toBe('COMPLETADO');
        });
    });

    it('should return 404 when updating non-existent pago', () => {
      return request(app.getHttpServer())
        .patch('/pagos/non-existent-id')
        .send({
          estado: 'COMPLETADO',
        })
        .expect(404);
    });
  });

  describe('/pagos/:id/historial (GET)', () => {
    it('should return pago history', () => {
      return request(app.getHttpServer())
        .get(`/pagos/${createdPagoId}/historial`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent pago history', () => {
      return request(app.getHttpServer())
        .get('/pagos/non-existent-id/historial')
        .expect(404);
    });
  });

  describe('/pagos/:id (DELETE)', () => {
    it('should soft delete a pago', () => {
      return request(app.getHttpServer())
        .delete(`/pagos/${createdPagoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPagoId);
          expect(res.body.deletedAt).toBeDefined();
        });
    });

    it('should return 404 when deleting non-existent pago', () => {
      return request(app.getHttpServer())
        .delete('/pagos/non-existent-id')
        .expect(404);
    });
  });
}); 
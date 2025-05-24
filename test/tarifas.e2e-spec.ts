import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifasModule } from '../src/tarifas/tarifas.module';
import { Tarifa } from '../src/tarifas/entities/tarifa.entity';

describe('TarifasController (e2e)', () => {
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
          entities: [Tarifa],
          synchronize: true,
        }),
        TarifasModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdTarifaId: string;

  describe('/tarifas (POST)', () => {
    it('should create a new tarifa', () => {
      return request(app.getHttpServer())
        .post('/tarifas')
        .send({
          tipo_conector: 'CCS',
          precio_kwh: 0.50,
          hora_inicio: '08:00',
          hora_fin: '18:00',
          moneda: 'USD',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.tipo_conector).toBe('CCS');
          expect(res.body.precio_kwh).toBe(0.50);
          createdTarifaId = res.body.id;
        });
    });
  });

  describe('/tarifas (GET)', () => {
    it('should return all tarifas', () => {
      return request(app.getHttpServer())
        .get('/tarifas')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/tarifas/:id (GET)', () => {
    it('should return a specific tarifa', () => {
      return request(app.getHttpServer())
        .get(`/tarifas/${createdTarifaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarifaId);
          expect(res.body.tipo_conector).toBe('CCS');
        });
    });

    it('should return 404 for non-existent tarifa', () => {
      return request(app.getHttpServer())
        .get('/tarifas/non-existent-id')
        .expect(404);
    });
  });

  describe('/tarifas/:id (PATCH)', () => {
    it('should update a tarifa', () => {
      return request(app.getHttpServer())
        .patch(`/tarifas/${createdTarifaId}`)
        .send({
          precio_kwh: 0.75,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarifaId);
          expect(res.body.precio_kwh).toBe(0.75);
        });
    });

    it('should return 404 when updating non-existent tarifa', () => {
      return request(app.getHttpServer())
        .patch('/tarifas/non-existent-id')
        .send({
          precio_kwh: 0.75,
        })
        .expect(404);
    });
  });

  describe('/tarifas/:id/historial (GET)', () => {
    it('should return tarifa history', () => {
      return request(app.getHttpServer())
        .get(`/tarifas/${createdTarifaId}/historial`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent tarifa history', () => {
      return request(app.getHttpServer())
        .get('/tarifas/non-existent-id/historial')
        .expect(404);
    });
  });

  describe('/tarifas/:id (DELETE)', () => {
    it('should soft delete a tarifa', () => {
      return request(app.getHttpServer())
        .delete(`/tarifas/${createdTarifaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarifaId);
          expect(res.body.deletedAt).toBeDefined();
        });
    });

    it('should return 404 when deleting non-existent tarifa', () => {
      return request(app.getHttpServer())
        .delete('/tarifas/non-existent-id')
        .expect(404);
    });
  });
}); 
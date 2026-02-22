import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetasModule } from '../src/tarjetas/tarjetas.module';
import { Tarjeta } from '../src/tarjetas/entities/tarjeta.entity';

describe('TarjetasController (e2e)', () => {
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
          entities: [Tarjeta],
          synchronize: true,
        }),
        TarjetasModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdTarjetaId: string;

  describe('/tarjetas (POST)', () => {
    it('should create a new tarjeta', () => {
      return request(app.getHttpServer())
        .post('/tarjetas')
        .send({
          numero_tarjeta: '4111111111111111',
          fecha_vencimiento: '12/25',
          cvv: '123',
          nombre_titular: 'John Doe',
          tipo: 'CREDITO',
          estado: 'ACTIVA',
          cliente_id: '1',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.numero_tarjeta).toBe('4111111111111111');
          expect(res.body.tipo).toBe('CREDITO');
          createdTarjetaId = res.body.id;
        });
    });
  });

  describe('/tarjetas (GET)', () => {
    it('should return all tarjetas', () => {
      return request(app.getHttpServer())
        .get('/tarjetas')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/tarjetas/:id (GET)', () => {
    it('should return a specific tarjeta', () => {
      return request(app.getHttpServer())
        .get(`/tarjetas/${createdTarjetaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarjetaId);
          expect(res.body.numero_tarjeta).toBe('4111111111111111');
        });
    });

    it('should return 404 for non-existent tarjeta', () => {
      return request(app.getHttpServer())
        .get('/tarjetas/non-existent-id')
        .expect(404);
    });
  });

  describe('/tarjetas/:id (PATCH)', () => {
    it('should update a tarjeta', () => {
      return request(app.getHttpServer())
        .patch(`/tarjetas/${createdTarjetaId}`)
        .send({
          estado: 'BLOQUEADA',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarjetaId);
          expect(res.body.estado).toBe('BLOQUEADA');
        });
    });

    it('should return 404 when updating non-existent tarjeta', () => {
      return request(app.getHttpServer())
        .patch('/tarjetas/non-existent-id')
        .send({
          estado: 'BLOQUEADA',
        })
        .expect(404);
    });
  });

  describe('/tarjetas/:id/historial (GET)', () => {
    it('should return tarjeta history', () => {
      return request(app.getHttpServer())
        .get(`/tarjetas/${createdTarjetaId}/historial`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent tarjeta history', () => {
      return request(app.getHttpServer())
        .get('/tarjetas/non-existent-id/historial')
        .expect(404);
    });
  });

  describe('/tarjetas/:id (DELETE)', () => {
    it('should soft delete a tarjeta', () => {
      return request(app.getHttpServer())
        .delete(`/tarjetas/${createdTarjetaId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTarjetaId);
          expect(res.body.deletedAt).toBeDefined();
        });
    });

    it('should return 404 when deleting non-existent tarjeta', () => {
      return request(app.getHttpServer())
        .delete('/tarjetas/non-existent-id')
        .expect(404);
    });
  });
}); 
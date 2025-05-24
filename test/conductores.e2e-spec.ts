import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from '../src/conductores/entities/conductor.entity';

describe('ConductoresController (e2e)', () => {
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
          database: 'test',
          entities: [Conductor],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testConductor = {
    nombre: 'Test',
    apellido: 'User',
    email: 'test@example.com',
    password: 'password123',
  };

  let createdConductorId: string;

  describe('/conductores (POST)', () => {
    it('should create a new conductor', () => {
      return request(app.getHttpServer())
        .post('/conductores')
        .send(testConductor)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nombre).toBe(testConductor.nombre);
          expect(res.body.apellido).toBe(testConductor.apellido);
          expect(res.body.email).toBe(testConductor.email);
          expect(res.body).not.toHaveProperty('password');
          createdConductorId = res.body.id;
        });
    });

    it('should not create a conductor with existing email', () => {
      return request(app.getHttpServer())
        .post('/conductores')
        .send(testConductor)
        .expect(400);
    });
  });

  describe('/conductores (GET)', () => {
    it('should return all conductors', () => {
      return request(app.getHttpServer())
        .get('/conductores')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/conductores/:email (GET)', () => {
    it('should return a conductor by email', () => {
      return request(app.getHttpServer())
        .get(`/conductores/${testConductor.email}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testConductor.email);
        });
    });

    it('should return 404 for non-existent email', () => {
      return request(app.getHttpServer())
        .get('/conductores/nonexistent@example.com')
        .expect(404);
    });
  });

  describe('/conductores/:email (PUT)', () => {
    it('should update a conductor', () => {
      const updateData = {
        nombre: 'Updated',
        apellido: 'User',
      };

      return request(app.getHttpServer())
        .put(`/conductores/${testConductor.email}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.nombre).toBe(updateData.nombre);
          expect(res.body.apellido).toBe(updateData.apellido);
        });
    });
  });

  describe('/conductores/filtrar (GET)', () => {
    it('should filter conductors', () => {
      return request(app.getHttpServer())
        .get('/conductores/filtrar')
        .query({ nombre: 'Updated' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].nombre).toBe('Updated');
        });
    });
  });

  describe('/conductores/:email (DELETE)', () => {
    it('should delete a conductor', () => {
      return request(app.getHttpServer())
        .delete(`/conductores/${testConductor.email}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).toBeDefined();
        });
    });

    it('should return 404 when trying to delete non-existent conductor', () => {
      return request(app.getHttpServer())
        .delete('/conductores/nonexistent@example.com')
        .expect(404);
    });
  });
}); 
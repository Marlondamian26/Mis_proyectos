// src/conductores/conductores.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Conductor } from './entities/conductor.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';

@Injectable()
export class ConductoresService {
  constructor(
    @InjectRepository(Conductor)
    private conductorRepository: Repository<Conductor>,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createConductorDto: CreateConductorDto, usuarioAuditoria: string): Promise<Conductor> {
    // Validar email único
    const exists = await this.conductorRepository.findOne({ where: { email: createConductorDto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    // Hash password
    const hashedPassword = await bcrypt.hash(createConductorDto.password, 10);
    
    const conductor = this.conductorRepository.create({
      ...createConductorDto,
      password: hashedPassword
    });

    const savedConductor = await this.conductorRepository.save(conductor);
    
    // Auditoría
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'conductores',
      operacion: 'CREATE',
      datosViejos: {},
      datosNuevos: savedConductor,
      usuario: usuarioAuditoria
    });

    return savedConductor;
  }

  async findAll(filters: Partial<Conductor> = {}): Promise<Conductor[]> {  // Agrega valor por defecto
    return this.conductorRepository.find({ where: this.cleanFilters(filters) });
  }
  
  private cleanFilters(filters: Partial<Conductor>): Partial<Conductor> {
    const cleaned = { ...filters };
    delete cleaned.password;
    delete cleaned.deletedAt;
    return cleaned;
  }

  async findOne(email: string): Promise<Conductor | null> {
    return this.conductorRepository.findOne({ where: { email } });
  }

  //sin implementación en el controller
  async findByEmail(email: string): Promise<Conductor | null> {
    return this.findOne(email);
  }

  async filtrarConductores(filtros: {
    nombre?: string;
    apellido?: string;
    email?: string;
   }) {
    const { nombre, apellido, email } = filtros;
    const query = this.conductorRepository.createQueryBuilder('conductor');

    if (nombre) {
      query.andWhere('conductor.nombre LIKE :nombre', { nombre: `%${nombre}%` });
    }
    if (apellido) {
      query.andWhere('conductor.apellido LIKE :apellido', { apellido: `%${apellido}%` });
    }
    if (email) {
      query.andWhere('conductor.email = :email', { email });
    }

    return query.getMany();
  }

  async update(id: string, updateConductorDto: UpdateConductorDto, usuarioAuditoria: string): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOneBy({ id });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');

    const oldData = { ...conductor };
    
    // Actualizar campos
    if (updateConductorDto.password) {
      updateConductorDto.password = await bcrypt.hash(updateConductorDto.password, 10);
    }
    Object.assign(conductor, updateConductorDto);

    const updatedConductor = await this.conductorRepository.save(conductor);
    
    // Auditoría
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'conductores',
      operacion: 'UPDATE',
      datosViejos: oldData,
      datosNuevos: updatedConductor,
      usuario: usuarioAuditoria
    });

    return updatedConductor;
  }

  async remove(id: string, usuarioAuditoria: string): Promise<void> {
    const conductor = await this.conductorRepository.findOneBy({ id });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');

    await this.conductorRepository.softDelete(id);
    
    // Auditoría
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'conductores',
      operacion: 'DELETE',
      datosViejos: conductor,
      datosNuevos: null,
      usuario: usuarioAuditoria
    });
  }

}

// src/tarjetas/tarjetas.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { TarjetaRFID } from './entities/tarjeta.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ConductoresService } from '../conductores/conductores.service';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';

@Injectable()
export class TarjetasService {
  constructor(
    @InjectRepository(TarjetaRFID)
    private tarjetaRepository: Repository<TarjetaRFID>,
    private auditoriaService: AuditoriaService,
    private conductoresService: ConductoresService,
  ) {}

  async create(createDto: CreateTarjetaDto, usuario: string): Promise<TarjetaRFID> {
    // Validar si el conductor existe
    if (createDto.conductor_id) {
      const conductor = await this.conductoresService.findOne(createDto.conductor_id);
      if (!conductor) throw new NotFoundException('Conductor no registrado');
    }

    const tarjeta = this.tarjetaRepository.create({
      ...createDto,
      fecha_emision: new Date(),
      es_temporal: !createDto.conductor_id // Temporal si no hay conductor
    });

    try {
      const saved = await this.tarjetaRepository.save(tarjeta);
      
      await this.auditoriaService.crearRegistro({
        tablaAfectada: 'tarjetas',
        operacion: 'CREATE',
        datosViejos: {},
        datosNuevos: saved,
        usuario
      });

      return saved;
    } catch (error) {
      throw new ConflictException('ID de tarjeta ya existe');
    }
  }

  async updateEstado(id: string, updateDto: UpdateTarjetaDto, usuario: string): Promise<TarjetaRFID> {
    const tarjeta = await this.tarjetaRepository.findOneBy({ id });
    if (!tarjeta) throw new NotFoundException('Tarjeta no encontrada');

    const oldData = { ...tarjeta };
    
    if (updateDto.estado) {
      tarjeta.estado = updateDto.estado;
      tarjeta.motivo_inactivacion = updateDto.motivo;
    }

    if (updateDto.fecha_expiracion) {
      tarjeta.fecha_expiracion = updateDto.fecha_expiracion;
    }

    const updated = await this.tarjetaRepository.save(tarjeta);
    
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'tarjetas',
      operacion: 'UPDATE',
      datosViejos: oldData,
      datosNuevos: updated,
      usuario
    });

    return updated;
  }

  async remove(id: string, motivo: string, usuario: string): Promise<void> {
    const tarjeta = await this.tarjetaRepository.findOneBy({ id });
    if (!tarjeta) throw new NotFoundException('Tarjeta no encontrada');

    await this.tarjetaRepository.softDelete(id);
    
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'tarjetas',
      operacion: 'DELETE',
      datosViejos: tarjeta,
      datosNuevos: { motivo },
      usuario
    });
  }

  async findByFilters(filters: {
    estado?: string;
    es_temporal?: boolean;
    conductor_id?: string;
    fecha_expiracion?: Date;
  }): Promise<TarjetaRFID[]> {
    return this.tarjetaRepository.find({
      where: {
        ...filters,
        fecha_expiracion: filters.fecha_expiracion ? MoreThanOrEqual(filters.fecha_expiracion) : undefined
      },
      relations: ['conductor']
    });
  }

  async findOne(id: string): Promise<TarjetaRFID> {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { id },
      relations: ['conductor', 'auditorias']
    });

    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }
    
    return tarjeta;
  }

  async findAll(filters: any): Promise<TarjetaRFID[]> {
    return this.tarjetaRepository.find({
      where: filters,
      relations: ['conductor'],
    });
  }

  async update(id: string, updateTarjetaDto: UpdateTarjetaDto, usuario: string): Promise<TarjetaRFID> {
    const tarjeta = await this.findOne(id);
    if (!tarjeta) {
      throw new NotFoundException('Tarjeta no encontrada');
    }
    return this.tarjetaRepository.save({
      ...tarjeta,
      ...updateTarjetaDto,
    });
  }

}
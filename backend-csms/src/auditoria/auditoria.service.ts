import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindOptionsWhere, Like, Between } from 'typeorm';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async crearRegistro(auditoriaData: {
    tablaAfectada: string;
    operacion: 'CREATE' | 'UPDATE' | 'DELETE';
    datosViejos?: any;
    datosNuevos?: any;
    usuario: string;
    detalles?: string;
  }) {
    const auditoria = this.auditoriaRepository.create(auditoriaData);
    return this.auditoriaRepository.save(auditoria);
  }

  async findByTablaAndId(tabla: string, id: string) {
    return this.auditoriaRepository.find({
      where: { tablaAfectada: tabla, datosNuevos: { id } },
      take: 10
    });
  }

  async findByCriterios(filtros: {
    tabla?: string;
    operacion?: string;
    usuario?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const where: FindOptionsWhere<Auditoria> = {};
    
    if (filtros.tabla) where.tablaAfectada = filtros.tabla;
    if (filtros.operacion) where.operacion = filtros.operacion as any;
    if (filtros.usuario) where.usuario = Like(`%${filtros.usuario}%`);
    if (filtros.fechaInicio && filtros.fechaFin) {
      where.fecha = Between(filtros.fechaInicio, filtros.fechaFin);
    }

    return this.auditoriaRepository.find({ where });
  }

  async findByTabla(tabla: string, paginationDto: PaginationDto) {
    return this.auditoriaRepository.find({
      where: { tablaAfectada: tabla },
      skip: paginationDto.offset,
      take: paginationDto.limit
    });
  }

  async findAll(paginationDto: PaginationDto) {
    return this.auditoriaRepository.find({
      skip: paginationDto.offset,
      take: paginationDto.limit
    });
  }

  async limpiarRegistrosAntiguos() {
    const unAnioAtras = new Date();
    unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
    
    await this.auditoriaRepository
      .createQueryBuilder()
      .delete()
      .where('fecha < :fecha', { fecha: unAnioAtras })
      .execute();
  }
}
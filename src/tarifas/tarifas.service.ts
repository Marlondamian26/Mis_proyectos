// src/tarifas/tarifas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa } from './entities/tarifa.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(Tarifa)
    private tarifasRepository: Repository<Tarifa>,
    private auditoriaService: AuditoriaService,
  ) {}

  convertirMoneda(tarifa: Tarifa): Tarifa {
    const TASA_CUP_USD = 24;
    return {
      ...tarifa,
      precio_equivalente: tarifa.moneda === 'CUP' 
        ? tarifa.precio_kwh / TASA_CUP_USD
        : tarifa.precio_kwh * TASA_CUP_USD
    };
  }

  async create(createTarifaDto: CreateTarifaDto, usuario: string): Promise<Tarifa> {
    const tarifa = this.tarifasRepository.create(createTarifaDto);
    const saved = await this.tarifasRepository.save(tarifa);
    
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'tarifas',
      operacion: 'CREATE',
      datosViejos: {},
      datosNuevos: saved,
      usuario
    });

    return saved;
  }

  async update(id: string, updateTarifaDto: UpdateTarifaDto, usuario: string): Promise<Tarifa> {
    const tarifa = await this.tarifasRepository.findOneBy({ id });
    
    if (!tarifa) {
      throw new NotFoundException(`Tarifa con ID ${id} no encontrada`);
    }

    const oldData = { ...tarifa };
    const updatedData = this.tarifasRepository.merge(tarifa, updateTarifaDto);
    
    const updated = await this.tarifasRepository.save(updatedData);
    
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'tarifas',
      operacion: 'UPDATE',
      datosViejos: oldData,
      datosNuevos: updated,
      usuario
    });

    return updated;
  }

  async remove(id: string, usuario: string): Promise<void> {
    const tarifa = await this.tarifasRepository.findOneBy({ id });
    
    if (!tarifa) {
      throw new NotFoundException(`Tarifa con ID ${id} no encontrada`);
    }
    
    await this.tarifasRepository.softDelete(id);
    
    await this.auditoriaService.crearRegistro({
      tablaAfectada: 'tarifas',
      operacion: 'DELETE',
      datosViejos: tarifa,
      datosNuevos: null,
      usuario
    });
  }

  async getHistorial(id: string) {
    return this.auditoriaService.findByTablaAndId('tarifas', id);
  }
}

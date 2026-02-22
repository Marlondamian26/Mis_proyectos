// src/pagos/pagos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private pagosRepository: Repository<Pago>,
    private configService: ConfigService
  ) {}

  // Modificar método create para incluir enlace
  async create(createPagoDto: CreatePagoDto): Promise<Pago> {
    const pago = this.pagosRepository.create({
      ...createPagoDto,
      estado: 'pendiente',
      fecha_hora: new Date()
    });

    const savedPago = await this.pagosRepository.save(pago);
    savedPago.enlace_pago = await this.generarEnlacePago(savedPago.id);
    
    return this.pagosRepository.save(savedPago);
  }

  // RF1: Generar enlace de pago
  async generarEnlacePago(pagoId: string): Promise<string> {
    const baseUrl = this.configService.get('APP_URL');
    const enlace = `${baseUrl}/pagar/${uuidv4()}`;
    
    await this.pagosRepository.update(pagoId, { enlace_pago: enlace });
    return enlace;
  }

  // RF2: Generar código QR
  async generarQRPago(pagoId: string): Promise<{ qr: string; expiracion: Date }> {
    const pago = await this.pagosRepository.findOneBy({ id: pagoId });
    
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    }
  
    const qrData = JSON.stringify({
      monto: pago.monto,
      moneda: 'CUP',
      pagoId: pago.id,
      expiracion: new Date(Date.now() + 15 * 60 * 1000)
    });

    const qrCode = await QRCode.toDataURL(qrData);
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    await this.pagosRepository.update(pagoId, { 
      qr_data: qrCode,
      qr_expiracion: expiracion 
    });

    return { qr: qrCode, expiracion };
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({ 
      where: { id },
      relations: ['conductor', 'tarifa']
    });
  
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    
    return pago;
  }

  async updateEstado(id: string, updatePagoDto: UpdatePagoDto): Promise<Pago> {
    const pago = await this.pagosRepository.findOneBy({ id });
    if (!pago) throw new Error('Pago no encontrado');
    
    Object.assign(pago, updatePagoDto);
    return this.pagosRepository.save(pago);
  }

  async findByFilters(filters: {
    fecha_inicio?: Date;
    fecha_fin?: Date;
    monto?: number;
    metodo_pago?: 'tarjeta' | 'efectivo';
    estado?: string;
    banco?: string;
    conductor_nombre?: string;
  }): Promise<Pago[]> {
    const query = this.pagosRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.conductor', 'conductor');

    if (filters.fecha_inicio && filters.fecha_fin) {
      query.andWhere({
        fecha_hora: Between(filters.fecha_inicio, filters.fecha_fin)
      });
    }

    if (filters.monto) {
      query.andWhere('pago.monto = :monto', { monto: filters.monto });
    }

    if (filters.metodo_pago) {
      query.andWhere('pago.metodo_pago = :metodo', { metodo: filters.metodo_pago });
    }

    if (filters.estado) {
      query.andWhere('pago.estado = :estado', { estado: filters.estado });
    }

    if (filters.banco) {
      query.andWhere('pago.banco ILIKE :banco', { banco: `%${filters.banco}%` });
    }

    if (filters.conductor_nombre) {
      query.andWhere('conductor.nombre ILIKE :nombre', { 
        nombre: `%${filters.conductor_nombre}%` 
      });
    }

    return query.getMany();
  }

    async findByExternalReference(referencia: string): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({ 
      where: { referencia_externa: referencia },
      relations: ['conductor', 'tarifa']
    });
  
    if (!pago) {
      throw new NotFoundException(`Pago con referencia ${referencia} no encontrado`);
    }
  
    return pago;
  }

  async update(id: string, updatePagoDto: UpdatePagoDto): Promise<Pago> {
    const pago = await this.findOne(id);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    return this.pagosRepository.save({
      ...pago,
      ...updatePagoDto,
    });
  }
}
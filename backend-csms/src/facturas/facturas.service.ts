import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-invoce.dto';
import { UpdateFacturaDto } from './dto/update-invoce.dto';
import { Pago } from '../pagos/entities/pago.entity';
import { Conductor } from '../conductores/entities/conductor.entity';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { AuditHistoryDto } from './dto/audit-history.dto';
import { FilterFacturasDto } from './dto/filter-invoices.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

interface UpdateData {
  [key: string]: any;
}

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    
    @InjectRepository(Conductor)
    private conductorRepository: Repository<Conductor>,
    
    @InjectRepository(Tarifa)
    private tarifaRepository: Repository<Tarifa>,
    private readonly auditService: AuditService,
  ) {}

  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const [pago, conductor, tarifa] = await Promise.all([
      this.pagoRepository.findOne({ 
        where: { id: createFacturaDto.pagoId },
        relations: ['tarifa']
      }),
      this.conductorRepository.findOneBy({ id: createFacturaDto.driverId }),
      this.tarifaRepository.findOneBy({ id: createFacturaDto.tarifaId })
    ]);

    if (!pago || !conductor || !tarifa) {
      throw new NotFoundException('Recurso relacionado no encontrado');
    }

    const consumoKwh = pago.monto / tarifa.precio_kwh;
    const iva = createFacturaDto.iva / 100 * pago.monto;

    const factura = this.facturaRepository.create({
      ...createFacturaDto,
      monto: pago.monto,
      moneda: tarifa.moneda,
      consumo_kwh: consumoKwh,
      iva,
      status: 'active',
      fecha_emision: new Date(),
      pago,
      conductor,
      tarifa
    });

    const savedFactura = await this.facturaRepository.save(factura);
    
    await this.auditService.log(
      'system', // Reemplazar con JWT en producción
      AuditAction.CREATE,
      'Factura',
      savedFactura.id,
      null,
      savedFactura
    );

    return savedFactura;
  }

  async annul(id: string, motivo: string): Promise<void> {
    const factura = await this.facturaRepository.findOneBy({ id });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const auditEntry: AuditHistoryDto = {
      action: 'ANNULLED',
      timestamp: new Date(),
      userId: 'system',
      changedFields: { motivo }
    };

    factura.status = 'annulled';
    factura.auditLogs.push(auditEntry);

    await this.facturaRepository.save(factura);
  }

  async findOne(id: string, formato: string, userId: string, userRole: string): Promise<Factura | Buffer> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['pago', 'conductor', 'tarifa']
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    if (userRole !== 'admin_cpo' && factura.conductor.id !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    if (formato === 'pdf') {
      return this.generatePdf(factura);
    }

    return factura;
  }

  async filter(filter: FilterFacturasDto): Promise<Factura[]> {
    const query = this.facturaRepository.createQueryBuilder('factura')
      .leftJoinAndSelect('factura.pago', 'pago')
      .leftJoinAndSelect('factura.conductor', 'conductor')
      .leftJoinAndSelect('factura.tarifa', 'tarifa')
      .where('factura.status = :status', { status: 'active' });

    if (filter.startDate && filter.endDate) {
      query.andWhere('factura.fecha_emision BETWEEN :start AND :end', {
        start: filter.startDate,
        end: filter.endDate
      });
    }

    if (filter.minAmount !== undefined) {
      query.andWhere('factura.monto >= :minAmount', { minAmount: filter.minAmount });
    }

    if (filter.maxAmount !== undefined) {
      query.andWhere('factura.monto <= :maxAmount', { maxAmount: filter.maxAmount });
    }

    if (filter.driverId) {
      query.andWhere('conductor.id = :driverId', { driverId: filter.driverId });
    }

    if (filter.status) {
      query.andWhere('factura.status = :status', { status: filter.status });
    }

    return query.getMany();
  }

  async update(id: string, updateDto: UpdateFacturaDto, usuario: string): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({ where: { id } });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    const oldData = { ...factura };
    
    // Transformar los nombres de las propiedades del DTO a la entidad
    const updateData: UpdateData = {};
    if (updateDto.notes !== undefined) {
      updateData.notas = updateDto.notes;
    }
    if (updateDto.paymentReference !== undefined) {
      updateData.referencia_pago = updateDto.paymentReference;
    }
    
    Object.assign(factura, updateData);
    
    const updatedFactura = await this.facturaRepository.save(factura);
    
    await this.auditService.log(
      usuario,
      AuditAction.UPDATE,
      'Factura',
      id,
      oldData,
      updatedFactura
    );

    return updatedFactura;
  }

  async getAuditHistory(id: string): Promise<AuditHistoryDto[]> {
    const factura = await this.facturaRepository.findOneBy({ id });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    return factura.auditLogs;
  }

  private generatePdf(factura: Factura): Buffer {
    // Implementación básica con pdfkit
    const PDFDocument = require('pdfkit');
    const pdfBuffer: Buffer[] = [];
    
    const doc = new PDFDocument();
    doc.on('data', pdfBuffer.push.bind(pdfBuffer));
    
    doc.fontSize(18).text(`Factura #${factura.id}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${factura.fecha_emision.toLocaleDateString()}`);
    doc.text(`Conductor: ${factura.conductor.nombre} ${factura.conductor.apellido}`);
    doc.text(`Monto: ${factura.moneda} ${factura.monto.toFixed(2)}`);
    doc.text(`Consumo: ${factura.consumo_kwh.toFixed(2)} kWh`);
    doc.text(`IVA: ${factura.iva.toFixed(2)}`);
    doc.end();

    return Buffer.concat(pdfBuffer);
  }
}
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profesional } from './entities/profesional.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Profesion } from '../profesion/entities/profesion.entity';
import { ProfesionalProfesion } from './entities/profesionalprofesion.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

const ROL_PROFESIONAL = 3;

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private profesionalRepo: Repository<Profesional>,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,

    @InjectRepository(Profesion)
    private profesionRepo: Repository<Profesion>,

    @InjectRepository(ProfesionalProfesion)
    private ppRepo: Repository<ProfesionalProfesion>,
  ) {}

  async create(dto: CreateProfesionalDto): Promise<Profesional> {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: dto.idUsuario },
      relations: ['rol', 'profesional'],
    });

    if (!usuario)
      throw new NotFoundException(`Usuario ${dto.idUsuario} no existe`);

    if (!usuario.rol || usuario.rol.idRol !== ROL_PROFESIONAL) {
      throw new BadRequestException(
        `El usuario ${dto.idUsuario} no tiene rol Profesional`,
      );
    }

    if (usuario.profesional)
      throw new BadRequestException(`Usuario ya es Profesional`);

    // Crear profesional con datos del DTO
    const profesional = this.profesionalRepo.create({
      usuario,
      matricula: dto.matricula,
      descripcion: dto.descripcion,
      calificacionPromedio: 0, // Siempre iniciar en 0
    });

    const savedProfesional = await this.profesionalRepo.save(profesional);

    // Si vienen profesiones
    if (dto.profesionesIds && dto.profesionesIds.length) {
      savedProfesional.profesiones = dto.profesionesIds.map(
        (id) =>
          ({
            idProfesional: savedProfesional.idProfesional,
            idProfesion: id,
          }) as ProfesionalProfesion,
      );

      await this.profesionalRepo.save(savedProfesional);
    }

    return this.findOne(savedProfesional.idProfesional);
  }
  findAll() {
    return this.profesionalRepo.find({
      relations: [
        'usuario',
        'usuario.rol',
        'profesiones',
        'profesiones.profesion',
      ],
    });
  }

  async findOne(id: number) {
    const profesional = await this.profesionalRepo.findOne({
      where: { idProfesional: id },
      relations: [
        'usuario',
        'usuario.rol',
        'profesiones',
        'profesiones.profesion',
      ],
    });

    if (!profesional)
      throw new NotFoundException(`Profesional ${id} no encontrado`);
    return profesional;
  }

  async update(id: number, dto: UpdateProfesionalDto): Promise<Profesional> {
    const profesional = await this.findOne(id);
    if (dto.calificacionPromedio !== undefined) {
      profesional.calificacionPromedio = Number(dto.calificacionPromedio);
    }
    if (dto.matricula !== undefined) profesional.matricula = dto.matricula;
    if (dto.descripcion !== undefined)
      profesional.descripcion = dto.descripcion;

    if (dto.profesionesIds) {
      profesional.profesiones = dto.profesionesIds.map(
        (id) =>
          ({
            idProfesional: profesional.idProfesional,
            idProfesion: id,
          }) as ProfesionalProfesion,
      );
    }

    await this.profesionalRepo.save(profesional);
    return this.findOne(profesional.idProfesional);
  }

  async remove(id: number): Promise<void> {
    const profesional = await this.profesionalRepo.findOne({
      where: { idProfesional: id },
      relations: ['profesiones', 'publicaciones'],
    });

    if (!profesional) {
      throw new NotFoundException(`Profesional ${id} no encontrado`);
    }

    // Si no tenés ON DELETE CASCADE en la BD, borrá manualmente las relaciones
    if (profesional.profesiones && profesional.profesiones.length) {
      await this.profesionalRepo.manager
        .getRepository('profesionalprofesion')
        .delete({ idProfesional: id });
    }

    // Si querés también borrar las publicaciones asociadas
    if (profesional.publicaciones && profesional.publicaciones.length) {
      await this.profesionalRepo.manager
        .getRepository('publicacion')
        .delete({ profesional: { idProfesional: id } });
    }

    // Finalmente borrá el profesional
    await this.profesionalRepo.remove(profesional);
  }
}

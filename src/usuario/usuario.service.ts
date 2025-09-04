import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,

    @InjectRepository(Profesional)
    private profesionalRepository: Repository<Profesional>,
  ) {}

  async crearUsuarioConRol(data: any): Promise<Usuario> {
    // 1. Buscar rol
    let rol = await this.rolRepository.findOneBy({ idRol: data.rol });
    if (!rol) throw new BadRequestException(`Rol con id ${data.rol} no existe`);

    // 2. Crear usuario
    const usuario = this.usuarioRepository.create({
      nombreCompleto: data.nombre,
      nombreDeUsuario: data.apellido,
      email: data.email,
      contrasena: data.contrasena,
      rol,
    });
    await this.usuarioRepository.save(usuario);

    // 3. Crear Cliente o Profesional según rol
    if (data.rol === 2) {
      let cliente = this.clienteRepository.create({ usuario });
      await this.clienteRepository.save(cliente);
    }

    if (data.rol === 3) {
      let profesional = this.profesionalRepository.create({
        usuario,
        profesiones: data.idProfesion,
      });
      await this.profesionalRepository.save(profesional);
    }

    return usuario;
  }

  findAll() {
    return this.usuarioRepository.find({ relations: ['rol'] });
  }

  findOne(id: number) {
    return this.usuarioRepository.findOne({
      where: { idUsuario: id },
      relations: ['rol'],
    });
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    // Buscar el usuario
    let usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
      relations: ['rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no existe`);
    }

    // Validar que exista el rol del body
    if (updateUsuarioDto.idRol) {
      let rol = await this.rolRepository.findOneBy({
        idRol: updateUsuarioDto.idRol,
      });
      if (!rol) {
        throw new BadRequestException(
          `El rol con id ${updateUsuarioDto.idRol} no existe en la base de datos`,
        );
      }
      usuario.rol = rol;
    }

    // Actualizar el resto de los campos
    let { idRol, ...resto } = updateUsuarioDto;
    Object.assign(usuario, resto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number) {
    let usuario = await this.findOne(id);
    if (!usuario) {
      return null;
    }
    await this.usuarioRepository.remove(usuario);
    return usuario;
  }
}

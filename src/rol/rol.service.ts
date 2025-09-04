import { Injectable } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find();
  }

  async findOne(id: number): Promise<Rol | null> {
    return this.rolRepository.findOneBy({ idRol: id });
  }

  create(createRolDto: CreateRolDto) {
    return 'This action adds a new rol';
  }

  update(id: number, updateRolDto: UpdateRolDto) {
    return this.rolRepository.update(id, updateRolDto);
  }

  remove(id: number) {
    return `This action removes a #${id} rol`;
  }
}

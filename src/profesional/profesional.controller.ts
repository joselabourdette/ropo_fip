import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { Profesional } from './entities/profesional.entity';

@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  @Post()
  create(@Body() createDto: CreateProfesionalDto): Promise<Profesional> {
    return this.profesionalService.create(createDto);
  }

  @Get()
  findAll(): Promise<Profesional[]> {
    return this.profesionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profesionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProfesionalDto) {
    return this.profesionalService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profesionalService.remove(+id);
  }
}

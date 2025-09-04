export class CreatePublicacionDto {
  idPublicacion: number;
  idProfesional: number;
  titulo: string;
  descripcion?: string;
  fechaPublicacion: Date;
  estado: string;
}

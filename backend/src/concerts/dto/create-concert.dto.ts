import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1, { message: 'Total seats must be at least 1' }) // กัน Admin เผลอกรอก 0 หรือติดลบ
  totalSeats: number;
}
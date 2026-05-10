import { IsInt, IsPositive } from 'class-validator';

export class ReserveDto {
  @IsInt()
  @IsPositive()
  concertId: number;
}

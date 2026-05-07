import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConcertDto } from './dto/create-concert.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConcertsService {
  constructor(private prisma: PrismaService) { }

  async create(createConcertDto: CreateConcertDto) {
    return this.prisma.concert.create({
      data: createConcertDto,
    });
  }

  async findAll() {
    return this.prisma.concert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const concert = await this.prisma.concert.findUnique({ where: { id } });
    if (!concert) throw new NotFoundException('Concert not found');

    return this.prisma.concert.delete({
      where: { id },
    });
  }
}
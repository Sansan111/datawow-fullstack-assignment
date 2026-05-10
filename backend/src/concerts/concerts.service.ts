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
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const concert = await this.prisma.concert.findUnique({ where: { id } });
    if (!concert) throw new NotFoundException('Concert not found');
    if (concert.deletedAt) throw new NotFoundException('Concert not found');

    const activeReservations = await this.prisma.reservation.findMany({
      where: { concertId: id, status: 'RESERVED' },
      select: { userId: true },
    });

    await this.prisma.$transaction([
      this.prisma.reservation.updateMany({
        where: { concertId: id, status: 'RESERVED' },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.concert.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      ...activeReservations.map((r) =>
        this.prisma.auditLog.create({
          data: { userId: r.userId, concertId: id, action: 'EVENT_DELETED' },
        }),
      ),
    ]);

    return { message: 'Concert deleted successfully' };
  }
}

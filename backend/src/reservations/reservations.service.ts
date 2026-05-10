import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async reserve(userId: number, concertId: number) {
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: { _count: { select: { reservations: { where: { status: 'RESERVED' } } } } },
    });

    if (!concert || concert.deletedAt) throw new NotFoundException('Concert not found');

    if (concert._count.reservations >= concert.totalSeats) {
      throw new BadRequestException('Concert is fully booked');
    }

    const existing = await this.prisma.reservation.findUnique({
      where: { userId_concertId: { userId, concertId } },
    });

    if (existing) {
      if (existing.status === 'RESERVED') {
        throw new ConflictException('You have already reserved a seat for this concert');
      }
      const [reservation] = await this.prisma.$transaction([
        this.prisma.reservation.update({
          where: { id: existing.id },
          data: { status: 'RESERVED' },
        }),
        this.prisma.auditLog.create({
          data: { userId, concertId, action: 'RESERVE' },
        }),
      ]);
      return { message: 'Reservation successful', reservation };
    }

    try {
      const [reservation] = await this.prisma.$transaction([
        this.prisma.reservation.create({
          data: { userId, concertId },
        }),
        this.prisma.auditLog.create({
          data: { userId, concertId, action: 'RESERVE' },
        }),
      ]);
      return { message: 'Reservation successful', reservation };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already reserved a seat for this concert');
      }
      throw error;
    }
  }

  async cancel(userId: number, reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.userId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this reservation');
    }

    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('Reservation is already cancelled');
    }

    await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.auditLog.create({
        data: { userId, concertId: reservation.concertId, action: 'CANCEL' },
      }),
    ]);
    return { message: 'Reservation cancelled successfully' };
  }

  async getMyActive(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId, status: 'RESERVED' },
      include: { concert: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyHistory(userId: number) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      include: { concert: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllHistory() {
    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { email: true } },
        concert: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [activeReservations, canceledReservations] = await Promise.all([
      this.prisma.reservation.count({ where: { status: 'RESERVED' } }),
      this.prisma.reservation.count({ where: { status: 'CANCELLED' } }),
    ]);
    return { activeReservations, canceledReservations };
  }
}

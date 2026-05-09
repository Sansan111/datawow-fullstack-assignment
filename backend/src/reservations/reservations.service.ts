import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  // reserve ticket
  async reserve(userId: number, concertId: number) {
    // get concert data with current reservation count (_count)
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: { _count: { select: { reservations: true } } },
    });

    if (!concert) throw new NotFoundException('Concert not found');

    // check if the seats are full
    if (concert._count.reservations >= concert.totalSeats) {
      throw new BadRequestException('Concert is fully booked');
    }

    try {
      // try to create reservation in database
      const reservation = await this.prisma.reservation.create({
        data: { userId, concertId },
      });
      return { message: 'Reservation successful', reservation };
    } catch (error) {
      // P2002 Error Code Prisma when data is duplicated
      // also already check from schema too
      if (error.code === 'P2002') {
        throw new ConflictException('You have already reserved a seat for this concert');
      }
      throw error;
    }
  }

  // cancel reservation
  async cancel(userId: number, reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    
    // prevent from canceling other user's reservation
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this reservation');
    }

    await this.prisma.reservation.delete({ where: { id: reservationId } });
    return { message: 'Reservation cancelled successfully' };
  }

  // get my reservation history
  async getMyHistory(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { concert: true }, // get concert details
      orderBy: { createdAt: 'desc' }
    });
  }

  // get all reservation history
  async getAllHistory() {
    return this.prisma.reservation.findMany({
      // get user email and concert name to show to Admin easily
      include: { 
        user: { select: { email: true } }, 
        concert: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
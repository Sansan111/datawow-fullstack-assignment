import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockPrisma = {
    concert: {
      findUnique: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reserve', () => {
    it('should reserve a seat and create audit log', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, deletedAt: null, _count: { reservations: 5 } };
      const reservation = { id: 1, userId: 1, concertId: 1, status: 'RESERVED' };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([reservation, {}]);

      const result = await service.reserve(1, 1);

      expect(result.message).toBe('Reservation successful');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reactivate a cancelled reservation and create audit log', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, deletedAt: null, _count: { reservations: 5 } };
      const cancelled = { id: 1, userId: 1, concertId: 1, status: 'CANCELLED' };
      const reactivated = { id: 1, userId: 1, concertId: 1, status: 'RESERVED' };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.findUnique.mockResolvedValue(cancelled);
      mockPrisma.$transaction.mockResolvedValue([reactivated, {}]);

      const result = await service.reserve(1, 1);

      expect(result.message).toBe('Reservation successful');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException when user already has active reservation', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, deletedAt: null, _count: { reservations: 5 } };
      const existing = { id: 1, userId: 1, concertId: 1, status: 'RESERVED' };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.findUnique.mockResolvedValue(existing);

      await expect(service.reserve(1, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockPrisma.concert.findUnique.mockResolvedValue(null);

      await expect(service.reserve(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when concert is soft-deleted', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, deletedAt: new Date(), _count: { reservations: 0 } };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);

      await expect(service.reserve(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when concert is fully booked', async () => {
      const concert = { id: 1, name: 'Full Concert', totalSeats: 2, deletedAt: null, _count: { reservations: 2 } };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);

      await expect(service.reserve(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should allow reservation when exactly one seat left', async () => {
      const concert = { id: 1, name: 'Almost Full', totalSeats: 10, deletedAt: null, _count: { reservations: 9 } };
      const reservation = { id: 1, userId: 1, concertId: 1, status: 'RESERVED' };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([reservation, {}]);

      const result = await service.reserve(1, 1);

      expect(result.message).toBe('Reservation successful');
    });
  });

  describe('cancel', () => {
    it('should soft-delete reservation and create audit log', async () => {
      const reservation = { id: 1, userId: 1, concertId: 1, status: 'RESERVED' };

      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.cancel(1, 1);

      expect(result.message).toBe('Reservation cancelled successfully');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user tries to cancel another users reservation', async () => {
      const reservation = { id: 1, userId: 2, concertId: 1, status: 'RESERVED' };

      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(service.cancel(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when reservation is already cancelled', async () => {
      const reservation = { id: 1, userId: 1, concertId: 1, status: 'CANCELLED' };

      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(service.cancel(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyHistory', () => {
    it('should return audit logs for user', async () => {
      const logs = [
        { id: 1, userId: 1, concertId: 1, action: 'RESERVE', concert: { name: 'Concert A' } },
        { id: 2, userId: 1, concertId: 1, action: 'CANCEL', concert: { name: 'Concert A' } },
      ];

      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.getMyHistory(1);

      expect(result).toEqual(logs);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { concert: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAllHistory', () => {
    it('should return all audit logs with user and concert details', async () => {
      const logs = [
        { id: 1, action: 'RESERVE', user: { email: 'test@test.com' }, concert: { name: 'Concert A' } },
        { id: 2, action: 'CANCEL', user: { email: 'test@test.com' }, concert: { name: 'Concert A' } },
      ];

      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.getAllHistory();

      expect(result).toEqual(logs);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        include: {
          user: { select: { email: true } },
          concert: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getStats', () => {
    it('should return active and canceled reservation counts', async () => {
      mockPrisma.reservation.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const result = await service.getStats();

      expect(result).toEqual({ activeReservations: 10, canceledReservations: 3 });
    });
  });
});

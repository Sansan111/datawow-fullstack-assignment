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
      delete: jest.fn(),
    },
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
    it('should reserve a seat successfully', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, _count: { reservations: 5 } };
      const reservation = { id: 1, userId: 1, concertId: 1 };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.create.mockResolvedValue(reservation);

      const result = await service.reserve(1, 1);

      expect(result.message).toBe('Reservation successful');
      expect(result.reservation).toEqual(reservation);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockPrisma.concert.findUnique.mockResolvedValue(null);

      await expect(service.reserve(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when concert is fully booked', async () => {
      const concert = { id: 1, name: 'Full Concert', totalSeats: 2, _count: { reservations: 2 } };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);

      await expect(service.reserve(1, 1)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already reserved this concert', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, _count: { reservations: 5 } };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.reserve(1, 1)).rejects.toThrow(ConflictException);
    });

    it('should rethrow unexpected errors from database', async () => {
      const concert = { id: 1, name: 'Test', totalSeats: 100, _count: { reservations: 5 } };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.reserve(1, 1)).rejects.toThrow('DB connection lost');
    });

    it('should allow reservation when exactly one seat left', async () => {
      const concert = { id: 1, name: 'Almost Full', totalSeats: 10, _count: { reservations: 9 } };
      const reservation = { id: 1, userId: 1, concertId: 1 };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.create.mockResolvedValue(reservation);

      const result = await service.reserve(1, 1);

      expect(result.message).toBe('Reservation successful');
    });
  });

  describe('cancel', () => {
    it('should cancel reservation successfully', async () => {
      const reservation = { id: 1, userId: 1, concertId: 1 };

      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);
      mockPrisma.reservation.delete.mockResolvedValue(reservation);

      const result = await service.cancel(1, 1);

      expect(result.message).toBe('Reservation cancelled successfully');
      expect(mockPrisma.reservation.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user tries to cancel another users reservation', async () => {
      const reservation = { id: 1, userId: 2, concertId: 1 };

      mockPrisma.reservation.findUnique.mockResolvedValue(reservation);

      await expect(service.cancel(1, 1)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.reservation.delete).not.toHaveBeenCalled();
    });
  });

  describe('getMyHistory', () => {
    it('should return user reservations with concert details', async () => {
      const reservations = [
        { id: 1, userId: 1, concertId: 1, concert: { name: 'Concert A' }, createdAt: new Date() },
      ];

      mockPrisma.reservation.findMany.mockResolvedValue(reservations);

      const result = await service.getMyHistory(1);

      expect(result).toEqual(reservations);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { concert: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no reservations', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.getMyHistory(1);

      expect(result).toEqual([]);
    });
  });

  describe('getAllHistory', () => {
    it('should return all reservations with user and concert details', async () => {
      const reservations = [
        { id: 1, userId: 1, concertId: 1, user: { email: 'test@test.com' }, concert: { name: 'Concert A' } },
      ];

      mockPrisma.reservation.findMany.mockResolvedValue(reservations);

      const result = await service.getAllHistory();

      expect(result).toEqual(reservations);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith({
        include: {
          user: { select: { email: true } },
          concert: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});

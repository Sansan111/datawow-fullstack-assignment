import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ConcertsService', () => {
  let service: ConcertsService;

  const mockPrisma = {
    concert: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto = { name: 'Test Concert', description: 'A test concert', totalSeats: 100 };
      const expected = { id: 1, ...dto, deletedAt: null, createdAt: new Date(), updatedAt: new Date() };

      mockPrisma.concert.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.concert.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should create a concert with minimum 1 seat', async () => {
      const dto = { name: 'Small Concert', description: 'Only 1 seat', totalSeats: 1 };
      const expected = { id: 2, ...dto, deletedAt: null, createdAt: new Date(), updatedAt: new Date() };

      mockPrisma.concert.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result.totalSeats).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return only active concerts with reservation count ordered by createdAt desc', async () => {
      const concerts = [
        { id: 2, name: 'Concert B', deletedAt: null, _count: { reservations: 5 } },
        { id: 1, name: 'Concert A', deletedAt: null, _count: { reservations: 0 } },
      ];

      mockPrisma.concert.findMany.mockResolvedValue(concerts);

      const result = await service.findAll();

      expect(result).toEqual(concerts);
      expect(mockPrisma.concert.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { reservations: { where: { status: 'RESERVED' } } } },
        },
      });
    });

    it('should return empty array when no concerts exist', async () => {
      mockPrisma.concert.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should soft-delete a concert, cancel reservations, and create audit logs', async () => {
      const concert = { id: 1, name: 'Test', deletedAt: null };
      const activeReservations = [{ userId: 1 }, { userId: 2 }];

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.reservation.findMany.mockResolvedValue(activeReservations);
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Concert deleted successfully' });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockPrisma.concert.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when concert is already soft-deleted', async () => {
      mockPrisma.concert.findUnique.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

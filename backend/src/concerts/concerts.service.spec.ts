import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ConcertsService', () => {
  let service: ConcertsService;
  let prisma: PrismaService;

  const mockPrisma = {
    concert: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto = { name: 'Test Concert', description: 'A test concert', totalSeats: 100 };
      const expected = { id: 1, ...dto, createdAt: new Date(), updatedAt: new Date() };

      mockPrisma.concert.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.concert.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should create a concert with minimum 1 seat', async () => {
      const dto = { name: 'Small Concert', description: 'Only 1 seat', totalSeats: 1 };
      const expected = { id: 2, ...dto, createdAt: new Date(), updatedAt: new Date() };

      mockPrisma.concert.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result.totalSeats).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all concerts ordered by createdAt desc', async () => {
      const concerts = [
        { id: 2, name: 'Concert B', description: 'desc', totalSeats: 200, createdAt: new Date(), updatedAt: new Date() },
        { id: 1, name: 'Concert A', description: 'desc', totalSeats: 100, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrisma.concert.findMany.mockResolvedValue(concerts);

      const result = await service.findAll();

      expect(result).toEqual(concerts);
      expect(mockPrisma.concert.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no concerts exist', async () => {
      mockPrisma.concert.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should delete a concert that exists', async () => {
      const concert = { id: 1, name: 'Test', description: 'desc', totalSeats: 100 };

      mockPrisma.concert.findUnique.mockResolvedValue(concert);
      mockPrisma.concert.delete.mockResolvedValue(concert);

      const result = await service.remove(1);

      expect(result).toEqual(concert);
      expect(mockPrisma.concert.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrisma.concert.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockPrisma.concert.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.concert.delete).not.toHaveBeenCalled();
    });
  });
});

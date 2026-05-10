import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user with USER role by default', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: 'test@test.com', role: 'USER' });

      const result = await service.register({ email: 'test@test.com', password: '123456' });

      expect(result.access_token).toBe('mock-token');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: '',
          email: 'test@test.com',
          password: 'hashed-password',
          role: 'USER',
        },
      });
    });

    it('should register a new user with ADMIN role when specified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: 'admin@test.com', role: 'ADMIN' });

      const result = await service.register({ email: 'admin@test.com', password: '123456', role: 'ADMIN' });

      expect(result.access_token).toBe('mock-token');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: '',
          email: 'admin@test.com',
          password: 'hashed-password',
          role: 'ADMIN',
        },
      });
    });

    it('should register with name when provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: 'test@test.com', role: 'USER' });

      await service.register({ name: 'John', email: 'test@test.com', password: '123456' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John',
          email: 'test@test.com',
          password: 'hashed-password',
          role: 'USER',
        },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(service.register({ email: 'test@test.com', password: '123456' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed', role: 'USER' });

      const result = await service.login({ email: 'test@test.com', password: '123456' });

      expect(result.access_token).toBe('mock-token');
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@test.com', role: 'USER' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@test.com', password: '123456' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed', role: 'USER' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});

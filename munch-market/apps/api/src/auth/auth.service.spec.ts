import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const user = {
    id: 'user-1',
    email: 'anna@example.com',
    name: 'Anna Kovács',
    role: 'customer',
    passwordHash: hashSync('munch123', 4),
  } as User;
  const users = { findOneBy: jest.fn(), findOneByOrFail: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: JwtService, useValue: new JwtService({ secret: 'test' }) },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('returns a token and the public user on valid credentials', async () => {
    users.findOneBy.mockResolvedValue(user);

    const result = await service.login('Anna@Example.com', 'munch123');

    expect(users.findOneBy).toHaveBeenCalledWith({ email: 'anna@example.com' });
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'anna@example.com',
      name: 'Anna Kovács',
      role: 'customer',
    });
  });

  it('rejects a wrong password', async () => {
    users.findOneBy.mockResolvedValue(user);

    await expect(service.login('anna@example.com', 'nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an unknown email', async () => {
    users.findOneBy.mockResolvedValue(null);

    await expect(service.login('nobody@example.com', 'munch123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

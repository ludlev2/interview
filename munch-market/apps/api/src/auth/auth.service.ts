import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtPayload } from './auth-user';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: User['role'];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOneBy({ email: email.toLowerCase() });
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.toPublic(user),
    };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findOneByOrFail({ id: userId });
    return this.toPublic(user);
  }

  private toPublic(user: User): PublicUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}

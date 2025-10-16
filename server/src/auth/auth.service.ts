import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(pass, user.password);
    if (matches) {
      // return user without password
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  async login(userCredentials: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(userCredentials.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const matches = await bcrypt.compare(userCredentials.password, user.password);
    if (!matches) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }
}

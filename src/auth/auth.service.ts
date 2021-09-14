import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const userFound = await this.userService.getUserByUsernameOrEmail(username);
    const hashPassword = await hash(password, 10);

    if (userFound && compare(hashPassword, userFound[0].password)) {
      const token = this.jwtService.sign(
        {
          userId: userFound[0].id,
          username: userFound[0].username,
          businessId: userFound[0].businessId,
        },
        { secret: this.configService.get<string>('CLIENT_SECRET') },
      );
      return {
        token: token,
      };
    }
    throw new UnauthorizedException('Username or Password is wrong');
  }
}

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

  async login(loginDto: LoginDto, isMobile: boolean) {
    const { username, password } = loginDto;
    const userFound = await this.userService.getUserByUsernameOrEmail(username);
    const roles = isMobile
      ? ['admin', 'resident', 'condos']
      : ['condos', 'admin'];

    if (userFound.length <= 0)
      throw new UnauthorizedException('No username or email in this system');

    const isPsEqual = await compare(password, userFound[0].password);

    if (isPsEqual && roles.includes(userFound[0].role)) {
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

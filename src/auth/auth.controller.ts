import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('')
  loginCMS(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, false);
  }

  @Post('/mobile')
  loginMobile(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, true);
  }
}

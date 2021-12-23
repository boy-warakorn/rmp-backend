import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from 'src/business/business.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => BusinessModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

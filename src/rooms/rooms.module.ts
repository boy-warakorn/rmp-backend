import { forwardRef, Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.model';
import { UsersModule } from 'src/users/users.module';
import { PostalsModule } from 'src/postals/postals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    UsersModule,
    forwardRef(() => PostalsModule),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}

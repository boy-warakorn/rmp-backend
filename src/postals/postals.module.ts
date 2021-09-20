import { forwardRef, Module } from '@nestjs/common';
import { PackagesService } from './postals.service';
import { PackagesController } from './postals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.model';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package]), forwardRef(() => RoomsModule)],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PostalsModule {}

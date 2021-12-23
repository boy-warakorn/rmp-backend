import { forwardRef, Module } from '@nestjs/common';
import { PackagesService } from './postals.service';
import { PackagesController } from './postals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.model';
import { RoomsModule } from 'src/rooms/rooms.module';
import { PackageImage } from './entities/package-image.model';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PackageImage]),
    forwardRef(() => RoomsModule),
    UsersModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PostalsModule {}

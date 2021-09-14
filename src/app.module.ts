import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './configs';
import { BussinessModule } from './business/business.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot(database), BussinessModule, UsersModule],
})
export class AppModule {}

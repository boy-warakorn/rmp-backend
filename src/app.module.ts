import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './configs';
import { UsersModule } from './users/users.module';
import { BussinessModule } from './business/business.module';

@Module({
  imports: [TypeOrmModule.forRoot(database), UsersModule, BussinessModule],
})
export class AppModule {}

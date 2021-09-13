import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './configs';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot(database), UsersModule],
})
export class AppModule {}

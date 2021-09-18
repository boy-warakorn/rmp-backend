import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [UsersModule],
})
export class AccountsModule {}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/add-account.dto';
import { GetAccountsQueryDto } from './dto/get-accounts-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getAccounts(
    @Req() req: Express.Request,
    @Query() query: GetAccountsQueryDto,
  ) {
    const { businessId } = req.user as any;
    return this.accountsService.getAccounts(businessId, query);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  createAccount(
    @Req() req: Express.Request,
    @Body() addAccountDto: AddAccountDto,
  ) {
    const { businessId } = req.user as any;
    return this.accountsService.createAccount(businessId, addAccountDto);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getAccount(@Param('id') id: string) {
    return this.accountsService.getAccount(id);
  }

  @Post('/:id/update')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.updateAccount(id, updateAccountDto);
  }
}

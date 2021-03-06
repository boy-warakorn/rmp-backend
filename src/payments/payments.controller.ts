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
import { GetPaymentsQueryDto } from './dto/get-payments-query.dto';
import { ImportPaymentDto } from './dto/import-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getPayments(
    @Query() query: GetPaymentsQueryDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.paymentsService.getPayments(
      businessId,
      query.status,
      query.roomNumber,
      '',
      query.buildingId,
    );
  }

  @Get('/residents')
  @UseGuards(JwtAuthGuard)
  getPaymentsByResident(
    @Query() query: GetPaymentsQueryDto,
    @Req() req: Express.Request,
  ) {
    const { businessId, id } = req.user as any;
    return this.paymentsService.getPayments(
      businessId,
      query.status,
      '',
      id,
      '',
    );
  }

  @Post('/imports')
  @UseGuards(JwtAuthGuard)
  importPayments(
    @Body() paymentDto: ImportPaymentDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.paymentsService.importPayment(paymentDto, businessId);
  }

  @Get('/common-charge')
  @UseGuards(JwtAuthGuard)
  getCommonCharge() {
    return { commonCharge: this.paymentsService.getCommonCharge() };
  }

  @Post('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  paySpecificPayment(
    @Param('id') id: string,
    @Body() payPaymentDto: PayPaymentDto,
  ) {
    return this.paymentsService.paySpecificPayment(id, payPaymentDto);
  }

  @Post('/:id/confirm')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  confirmPayment(@Param('id') id: string) {
    return this.paymentsService.confirmPayment(id);
  }

  @Post('/:id/reject')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  rejectPayment(@Param('id') id: string) {
    return this.paymentsService.rejectPayment(id);
  }

  @Get('/:id/receipt')
  @UseGuards(JwtAuthGuard)
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }
}

export class ImportPaymentDto {
  payments: PaymentDto[];
}

class PaymentDto {
  type: string;
  roomNumber: string;
  amount: number;
}

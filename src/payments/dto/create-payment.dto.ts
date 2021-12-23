export class CreatePaymentDto {
  type: string;
  roomId: string;
  businessId: string;
  status: string;
  amount: number;
  isRenew: boolean;
}

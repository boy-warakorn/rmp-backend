export class CreatePaymentDto {
  type: string;
  roomNumber: string;
  businessId: string;
  status: string;
  amount: number;
  isRenew: boolean;
}

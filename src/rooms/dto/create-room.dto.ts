export class CreateRoomDto {
  roomNumber: string;
  type: string;
  size: number;
  pricePerMonth: number;
  purchasePrice: number;
  lastMoveAt: string;
  unit: string;
  buildingId: string;
  floor: string;
}

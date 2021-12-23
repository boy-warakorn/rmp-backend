export class CreateBuildingDto {
  buildingName: string;
  defaultCostPerMonth: number;
  baseCommonCharge: number;
  address: string;
  roomPrefix: string;
  floors: number;
  rooms: RoomDto[];
}

export interface RoomDto {
  floor: number;
  roomNumber: string;
  size: number;
  type: string;
  costPerMonth: number;
  unit: string;
}

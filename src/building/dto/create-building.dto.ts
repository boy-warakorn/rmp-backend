export class CreateBuildingDto {
  buildingName: string;
  defaultCostPerMonth: string;
  baseCommonCharge: string;
  address: string;
  roomPrefix: string;
  floors: string;
  rooms: RoomDto[];
}

export interface RoomDto {
  floor: string;
  roomNumber: string;
  size: string;
  type: string;
  costPerMonth: string;
  unit: string;
}

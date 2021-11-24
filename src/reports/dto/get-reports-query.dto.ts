export class GetReportsQueryDto {
  status: string;
  roomNumber: string;
  buildingId: string;
  type: 'complaint' | 'maintenance';
  mobile: boolean;
}

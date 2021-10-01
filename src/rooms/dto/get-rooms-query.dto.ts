export class GetRoomsQueryDto {
  filter_tab: 'unoccupied' | 'occupied' | 'overdued';
  roomNumber: string;
}

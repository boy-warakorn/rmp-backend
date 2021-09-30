export class GetRoomsQueryDto {
  filter_tab: 'unoccupied' | 'occupied';
  roomNumber: string;
}

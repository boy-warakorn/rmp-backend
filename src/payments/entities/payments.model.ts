import { Business } from 'src/business/entities/business.model';
import { Room } from 'src/rooms/entities/room.model';
import { Column, JoinColumn, ManyToOne } from 'typeorm';

export class Payment {
  @Column({ type: 'uuid' })
  id: string;

  @Column()
  type: string;

  @Column()
  roomRoomNumber: string;

  @Column()
  businessId: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  rejectNote: string;

  @Column()
  amount: number;

  @Column()
  isRenew: boolean;

  @Column({ nullable: true })
  receiptUrl: string;

  @ManyToOne(() => Business, (business) => business.payment)
  @JoinColumn()
  business: Business;

  @ManyToOne(() => Room, (room) => room.payment)
  @JoinColumn()
  room: Room;
}

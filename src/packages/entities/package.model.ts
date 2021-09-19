import { Business } from 'src/business/entities/business.model';
import { Room } from 'src/rooms/entities/room.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  note: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz' })
  arrivedAt: string;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: string;

  @Column()
  postalService: string;

  @Column()
  roomRoomNumber: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Room, (room) => room.report)
  @JoinColumn()
  room: Room;

  @ManyToOne(() => Business, (business) => business.report)
  @JoinColumn()
  business: Business;
}

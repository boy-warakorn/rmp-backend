import { Business } from 'src/business/entities/business.model';
import { Room } from 'src/rooms/entities/room.model';
import { User } from 'src/users/entities/user.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  detail: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  respondDetail: string;

  @Column({ type: 'timestamptz' })
  requestedDate: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedDate: string;

  @Column()
  roomRoomNumber: string;

  @Column()
  businessId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.report)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Room, (room) => room.report)
  @JoinColumn()
  room: Room;

  @ManyToOne(() => Business, (business) => business.report)
  @JoinColumn()
  business: Business;
}
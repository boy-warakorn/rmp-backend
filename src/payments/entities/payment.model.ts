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
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  roomId: string;

  @Column()
  businessId: string;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: string;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: string;

  @Column({ type: 'timestamptz' })
  issuedAt: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: string;

  @Column({ type: 'timestamptz' })
  duedAt: string;

  @Column({ nullable: true })
  rejectNote: string;

  @Column()
  amount: number;

  @Column({ type: 'boolean' })
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

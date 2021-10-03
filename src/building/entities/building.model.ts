import { Business } from 'src/business/entities/business.model';
import { Room } from 'src/rooms/entities/room.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  buildingName: string;

  @Column({ type: 'double precision' })
  defaultCostPerMonth: number;

  @Column({ type: 'double precision' })
  baseCommonCharge: number;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  roomPrefix: string;

  @Column({ type: 'varchar' })
  floors: number;

  @Column()
  businessId: string;

  @OneToMany(() => Room, (room) => room.building)
  @JoinColumn()
  room: Room[];

  @ManyToOne(() => Business, (business) => business.building)
  @JoinColumn()
  business: Business[];
}

import { Payment } from 'src/payments/entities/payments.model';
import { Package } from 'src/postals/entities/package.model';
import { Report } from 'src/reports/entities/report.model';
import { Room } from 'src/rooms/entities/room.model';
import { User } from 'src/users/entities/user.model';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.business)
  user: User[];

  @OneToMany(() => Room, (room) => room.business)
  room: Room[];

  @OneToMany(() => Report, (report) => report.business)
  report: Report[];

  @OneToMany(() => Package, (packageEle) => packageEle.business)
  package: Package[];

  @OneToMany(() => Payment, (payment) => payment.business)
  payment: Payment[];
}

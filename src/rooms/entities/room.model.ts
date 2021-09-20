import { Business } from 'src/business/entities/business.model';
import { Payment } from 'src/payments/entities/payments.model';
import { Package } from 'src/postals/entities/package.model';
import { Report } from 'src/reports/entities/report.model';
import { User } from 'src/users/entities/user.model';
import {
  PrimaryColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryColumn({ type: 'varchar' })
  roomNumber: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'double precision' })
  size: number;

  @Column({ type: 'double precision' })
  pricePerMonth: number;

  @Column({ type: 'double precision' })
  purchasePrice: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastMoveAt: string;

  @Column({ type: 'varchar' })
  unit: string;

  @Column()
  businessId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Business, (business) => business.room)
  @JoinColumn()
  business: Business;

  @OneToMany(() => Report, (report) => report.room)
  @JoinColumn()
  report: Report[];

  @OneToMany(() => Package, (packageEle) => packageEle.room)
  @JoinColumn()
  package: Package[];

  @OneToMany(() => Payment, (payment) => payment.room)
  @JoinColumn()
  payment: Payment[];

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: string;
}

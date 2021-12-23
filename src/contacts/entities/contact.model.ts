import { Business } from 'src/business/entities/business.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column()
  email: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.payment)
  @JoinColumn()
  business: Business;
}

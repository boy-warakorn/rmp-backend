import { Business } from 'src/business/entities/business.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => Business, (business) => business.user)
  business: Business;
}

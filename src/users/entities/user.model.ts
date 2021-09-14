import { Business } from 'src/business/entities/business.model';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash, compare } from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column()
  role: string;

  @Column()
  email: string;

  @Column()
  businessId: string;

  @ManyToOne((type) => Business, (business) => business.user)
  @JoinColumn()
  business: Business;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    console.log(`this.password`, this.password);
    this.password = await hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await compare(attempt, this.password);
  }
}

import { Business } from 'src/business/entities/business.model';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { Room } from 'src/rooms/entities/room.model';

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

  @Column()
  citizenNumber: string;

  @ManyToOne(() => Business, (business) => business.user)
  @JoinColumn()
  business: Business;

  @OneToOne(() => Room, (room) => room.user)
  room: Room;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await compare(attempt, this.password);
  }
}

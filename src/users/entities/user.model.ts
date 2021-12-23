import { Business } from 'src/business/entities/business.model';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { Room } from 'src/rooms/entities/room.model';
import { Report } from 'src/reports/entities/report.model';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  businessId: string;

  @Column()
  citizenNumber: string;

  @Column({ type: 'boolean' })
  isDelete: boolean;

  @ManyToOne(() => Business, (business) => business.user)
  @JoinColumn()
  business: Business;

  @Column({ type: 'timestamptz' })
  createdAt: string;

  @OneToOne(() => Room, (room) => room.user)
  room: Room;

  @OneToMany(() => Report, (report) => report.room)
  @JoinColumn()
  report: Report[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await compare(attempt, this.password);
  }
}

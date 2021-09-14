import { User } from 'src/users/entities/user.model';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany((type) => User, (user) => user.business)
  user: User[];
}

import { Room } from 'src/rooms/entities/room.model';
import { User } from 'src/users/entities/user.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.model';

@Entity()
export class PackageImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imgUrl: string;

  @Column()
  packageId: string;

  @ManyToOne(() => Package, (postal) => postal.packageImage)
  @JoinColumn()
  postal: Package;
}

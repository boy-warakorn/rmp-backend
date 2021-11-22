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
import { PackageImage } from './package-image.model';

@Entity()
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  note: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz' })
  arrivedAt: string;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: string;

  @Column()
  postalService: string;

  @Column()
  roomId: string;

  @Column({ nullable: true })
  roomRoomNumber: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Room, (room) => room.package)
  @JoinColumn()
  room: Room;

  @ManyToOne(() => Business, (business) => business.report)
  @JoinColumn()
  business: Business;

  @OneToMany(() => PackageImage, (packageImage) => packageImage.postal)
  @JoinColumn()
  packageImage: PackageImage;
}

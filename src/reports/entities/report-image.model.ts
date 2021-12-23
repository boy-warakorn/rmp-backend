import { Business } from 'src/business/entities/business.model';
import { Room } from 'src/rooms/entities/room.model';
import { User } from 'src/users/entities/user.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from './report.model';

@Entity()
export class ReportImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imgUrl: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, (report) => report.reportImage)
  @JoinColumn()
  report: Report;
}

import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['businessName'])
export class Business {
  @PrimaryGeneratedColumn()
  businessID: string;

  @Column()
  businessName: string;
}

import { MaxLength } from 'class-validator';

export class CreateBusinessDto {
  @MaxLength(5)
  businessName: string;
}

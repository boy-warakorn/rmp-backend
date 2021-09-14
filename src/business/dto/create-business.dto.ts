import { MaxLength } from 'class-validator';

export class CreateBusinessDto {
  @MaxLength(5, {
    message:
      'Title is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  businessName: string;
}

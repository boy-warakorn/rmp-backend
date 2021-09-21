import { PartialType } from '@nestjs/mapped-types';
import { EditContactDto } from './edit-contact.dto';

export class CreateContactDto {
  address: string;
  name: string;
  role: string;
  phoneNuber: string;
}

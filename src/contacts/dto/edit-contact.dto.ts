import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';

export class EditContactDto extends PartialType(CreateContactDto) {}

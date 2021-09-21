import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  createContact(
    @Body() createContactDto: CreateContactDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.contactsService.createContact(businessId, createContactDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  getContacts(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.contactsService.getContacts(businessId);
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }

  @Post('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  editContact(@Param('id') id: string, @Body() editContactDto: EditContactDto) {
    return this.contactsService.editContact(id, editContactDto);
  }
}

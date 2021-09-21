import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { Contact } from './entities/contact.model';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async createContact(businessId: string, createContactDto: CreateContactDto) {
    try {
      await this.contactRepository.save({
        ...createContactDto,
        businessId: businessId,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContacts(businessId: string) {
    try {
      const contacts = await this.contactRepository.find({
        businessId: businessId,
      });

      return {
        contacts: contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          role: contact.role,
          phoneNumber: contact.phoneNumber,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async getContact(contactId: string) {
    try {
      const contact = await this.contactRepository.findOne(contactId);

      return {
        id: contact.id,
        name: contact.name,
        role: contact.role,
        phoneNumber: contact.phoneNumber,
        address: contact.address,
        email: contact.email,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteContact(contactId: string) {
    try {
      await this.contactRepository.delete(contactId);
    } catch (error) {
      throw error;
    }
  }

  async editContact(contactId: string, editContactDto: EditContactDto) {
    try {
      await this.contactRepository.save({ id: contactId, ...editContactDto });
    } catch (error) {}
  }
}

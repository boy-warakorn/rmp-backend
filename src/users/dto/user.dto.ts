export class UserDto {
  id: string;
  profile: {
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
  businessName: string;
}

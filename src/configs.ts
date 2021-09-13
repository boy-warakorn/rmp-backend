import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const database: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: 5555,
  username: process.env.DATABASE_USERNAME ?? 'rmp_user',
  password: process.env.DATABASE_PASSWORD ?? 'rmp_13579qe123',
  database: 'rmp_database',
  entities: [join(__dirname, './**/*.model{.ts,.js}')],
  synchronize: true,
};

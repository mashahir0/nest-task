import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '../ormconfig';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          ...(await ormconfig.initialize().then(() => ormconfig.options).catch(() => ormconfig.options)),
        };
      }
    }),
    AuthModule,
    UsersModule
  ],
})
export class AppModule {}

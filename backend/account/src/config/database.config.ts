import { Inject, Injectable } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppConfigService } from './app.config';

const env = process.env;

export const databaseConfig = registerAs('database', () => ({
  url: env.DATABASE_URL,
  autoLoadEntities: env.DB_AUTOLOADENTITIES as unknown as boolean,
  synchronize: env.DB_SYNCHRONIZE as unknown as boolean,
}));

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(databaseConfig.KEY)
    private dbConfig: ConfigType<typeof databaseConfig>,
    private appConfig: AppConfigService
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.dbConfig,
      ssl: this.appConfig.isProd,
      type: 'postgres',
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}

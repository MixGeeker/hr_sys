import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Client } from 'pg';

export const databaseProviders = [
  {
    provide: DataSource,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dbConfig = {
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
      };

      const client = new Client({ ...dbConfig, database: 'postgres' });
      try {
        await client.connect();
        const res = await client.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [dbConfig.database],
        );
        if (res.rowCount === 0) {
          console.log(
            `Database "${dbConfig.database}" not found. Creating it...`,
          );
          await client.query(`CREATE DATABASE "${dbConfig.database}"`);
          console.log(`Database "${dbConfig.database}" created successfully.`);
        }
      } catch (error) {
        console.error('Error checking or creating database:', error);
        throw error;
      } finally {
        await client.end();
      }

      const targetDbClient = new Client(dbConfig);
      try {
        await targetDbClient.connect();
        await targetDbClient.query('CREATE EXTENSION IF NOT EXISTS pg_trgm'); // 打开pg_trgm扩展
        await targetDbClient.query(
          'CREATE EXTENSION IF NOT EXISTS pg_stat_statements',
        ); // 打开pg_stat_statements扩展
        console.log('PostgreSQL extensions enabled successfully.');
      } catch (error) {
        console.error('Error enabling extensions:', error);
      } finally {
        await targetDbClient.end();
      }

      const dataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        subscribers: [],
        // 通过 PostgreSQL 连接参数设置时区为 UTC
        extra: {
          timezone: 'UTC',
        },
      });

      return dataSource.initialize();
    },
  },
];

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const log: [{ emit: 'event'; level: 'query' }, 'warn', 'error'] = [
  { emit: 'event', level: 'query' },
  'warn',
  'error',
];

@Injectable()
export class PrismaService
  extends PrismaClient<{ log: typeof log; adapter: PrismaPg }>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    super({ adapter: new PrismaPg({ connectionString }), log });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('PostgreSQL connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

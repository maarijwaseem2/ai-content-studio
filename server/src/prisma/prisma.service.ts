import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL is not set!');
    } else {
      console.log('DATABASE_URL starts with:', dbUrl.slice(0, 8));
      console.log('DATABASE_URL length:', dbUrl.length);
      if (!dbUrl.startsWith('mysql://')) {
        console.error('DATABASE_URL missing mysql:// protocol!');
      }
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

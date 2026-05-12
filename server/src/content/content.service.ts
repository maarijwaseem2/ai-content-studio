import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.content.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSaved(userId: string) {
    return this.prisma.content.findMany({
      where: { userId, isSaved: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.content.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.content.deleteMany({
      where: { id, userId },
    });
  }
}

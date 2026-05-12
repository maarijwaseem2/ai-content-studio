import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        credits: true,
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
      },
    });
  }

  async subscribe(userId: string, tier: string) {
    return this.prisma.subscriptionRequest.create({
      data: {
        userId,
        tier: tier.toUpperCase(),
        status: 'PENDING',
      },
    });
  }
}

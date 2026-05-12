import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalGenerations = await this.prisma.content.count();
    const avgCredits = await this.prisma.user.aggregate({
      _avg: { credits: true },
    });

    const activeUsers7d = await this.prisma.user.count({
      where: {
        items: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    const generations = await this.prisma.content.findMany({
      select: { tokenUsage: true, tone: true, language: true },
    });

    const totalTokensAllTime = generations.reduce((acc, curr: any) => {
      const usage = curr.tokenUsage;
      return acc + (usage?.total_tokens || 0);
    }, 0);

    const tones = generations.reduce((acc, curr) => {
      const tone = curr.tone || 'Neutral';
      acc[tone] = (acc[tone] || 0) + 1;
      return acc;
    }, {});

    const langs = generations.reduce((acc, curr) => {
      const lang = curr.language || 'English';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const topTone =
      Object.entries(tones).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
      '—';
    const topLang =
      Object.entries(langs).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
      '—';

    return {
      totalUsers,
      totalGenerations,
      activeUsers7d,
      avgCredits: Math.round(avgCredits._avg.credits || 0),
      topTone,
      topLang,
      totalTokens: totalTokensAllTime,
      tonesDistribution: tones,
    };
  }

  async getSubscriptionRequests() {
    return (this.prisma as any).subscriptionRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveSubscriptionRequest(requestId: string) {
    const request = await (this.prisma as any).subscriptionRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error('Request not found');

    const creditsMap = {
      FREE: 20,
      STARTER: 250,
      PRO: 1000,
      BUSINESS: 5000,
    };
    const credits = creditsMap[request.tier.toUpperCase()] || 0;

    return this.prisma.$transaction(async (tx) => {
      await (tx as any).subscriptionRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionTier: request.tier,
          credits: { increment: credits },
        },
      });
    });
  }

  async rejectSubscriptionRequest(requestId: string) {
    return (this.prisma as any).subscriptionRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async getUsers(search?: string) {
    const where = search
      ? {
          email: { contains: search },
        }
      : {};

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        credits: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: { items: true },
        },
        items: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      ...u,
      lastUsed: u.items[0]?.createdAt || null,
    }));
  }

  async getUsageStats() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const content = await this.prisma.content.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    });

    const stats = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayLabel = `D${14 - i}`;
      const count = content.filter(
        (c) => c.createdAt.toDateString() === date.toDateString(),
      ).length;
      return { label: dayLabel, val: count };
    }).reverse();

    return stats;
  }

  async getAllContent() {
    return this.prisma.content.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100
    });
  }

  async getUserContent(userId: string) {
    return this.prisma.content.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

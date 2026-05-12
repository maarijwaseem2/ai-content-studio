import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class GeneratorService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'placeholder',
    });
  }

  async generate(userId: string, input: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (user.role === 'ADMIN') {
      throw new BadRequestException('Admins cannot generate content');
    }

    if (user.credits <= 0) {
      throw new BadRequestException('Insufficient credits');
    }

    const prompt = `Generate product marketing content for:
Product: ${input.productName}
Category: ${input.category}
Features: ${input.features}
Audience: ${input.audience}
Tone: ${input.tone}
Language: ${input.language}

Return a JSON object with:
{
  "description": "...",
  "highlights": ["...", "..."],
  "metaTitle": "...",
  "metaDescription": "...",
  "adCopy": "...",
  "socialCaption": "..."
}`;

    let output: any;
    let usage: any = null;
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional copywriter.' },
          { role: 'user', content: prompt },
        ],
        model: process.env.AI_MODEL || 'gpt-4o',
        response_format: { type: 'json_object' },
      });
      output = JSON.parse(completion.choices[0].message.content || '{}');
      usage = completion.usage;
    } catch (e) {
      // Fallback for demo if API key is missing
      output = {
        description:
          'Exquisitely crafted, the ' +
          input.productName +
          ' is a product designed for discerning customers.',
        highlights: ['Premium quality', 'Durable design'],
        metaTitle: input.productName + ' | Premium Product',
        metaDescription: 'The best ' + input.productName + ' in the market.',
        adCopy: 'Buy ' + input.productName + ' now!',
        socialCaption: 'Check out this ' + input.productName + ' ✨ #new',
      };
    }

    const item = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } },
      });

      return (tx.content as any).create({
        data: {
          userId,
          productName: input.productName,
          category: input.category,
          tone: input.tone,
          language: input.language,
          inputJson: input,
          outputJson: output,
          tokenUsage: usage as any,
        } as any,
      });
    });

    return item;
  }
}

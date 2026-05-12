import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('generator')
export class GeneratorController {
  constructor(private generatorService: GeneratorService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generate(@Request() req, @Body() body: any) {
    return this.generatorService.generate(req.user.id, body);
  }
}

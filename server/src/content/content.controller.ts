import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll(@Request() req) {
    return this.contentService.findAll(req.user.id);
  }

  @Get('saved')
  findSaved(@Request() req) {
    return this.contentService.findSaved(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.contentService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.contentService.remove(id, req.user.id);
  }
}

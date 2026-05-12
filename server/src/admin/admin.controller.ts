import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard'; // I need to create this
import { Roles } from '../auth/roles.decorator'; // I need to create this

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Get('usage')
  getUsage() {
    return this.adminService.getUsageStats();
  }

  @Get('generations')
  @Roles('ADMIN')
  getAllGenerations() {
    return this.adminService.getAllContent();
  }

  @Get('subscription-requests')
  @Roles('ADMIN')
  getSubscriptionRequests() {
    return this.adminService.getSubscriptionRequests();
  }

  @Post('subscription-requests/:id/approve')
  @Roles('ADMIN')
  approveRequest(@Param('id') id: string) {
    return this.adminService.approveSubscriptionRequest(id);
  }

  @Post('subscription-requests/:id/reject')
  @Roles('ADMIN')
  rejectRequest(@Param('id') id: string) {
    return this.adminService.rejectSubscriptionRequest(id);
  }

  @Get('users/:id/content')
  @Roles('ADMIN')
  getUserContent(@Param('id') id: string) {
    return this.adminService.getUserContent(id);
  }
}

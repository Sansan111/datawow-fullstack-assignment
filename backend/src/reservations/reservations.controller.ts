import { Controller, Get, Post, Param, Delete, UseGuards, Req, ParseIntPipe, Body } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// must be logged in to access this controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  // get request body as { "concertId": 1 } 
  reserve(@Req() req, @Body('concertId', ParseIntPipe) concertId: number) {
    const userId = req.user.userId; // แกะ id ของคนที่ล็อกอินมาจาก Token
    return this.reservationsService.reserve(userId, concertId);
  }

  @Get('history')
  // users can see their reservation history
  getMyHistory(@Req() req) {
    const userId = req.user.userId;
    return this.reservationsService.getMyHistory(userId);
  }

  @Get('all')
  @Roles('ADMIN') // ADMIN only
  getAllHistory() {
    return this.reservationsService.getAllHistory();
  }

  @Delete(':id')
  // get reservation id from url 
  cancel(@Req() req, @Param('id', ParseIntPipe) reservationId: number) {
    const userId = req.user.userId;
    return this.reservationsService.cancel(userId, reservationId);
  }
}
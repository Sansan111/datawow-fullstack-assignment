import { Controller, Get, Post, Param, Delete, UseGuards, Req, ParseIntPipe, Body } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReserveDto } from './dto/reserve.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  reserve(@Req() req, @Body() dto: ReserveDto) {
    const userId = req.user.userId;
    return this.reservationsService.reserve(userId, dto.concertId);
  }

  @Get('history')
  getMyHistory(@Req() req) {
    const userId = req.user.userId;
    return this.reservationsService.getMyHistory(userId);
  }

  @Get('all')
  @Roles('ADMIN')
  getAllHistory() {
    return this.reservationsService.getAllHistory();
  }

  @Delete(':id')
  cancel(@Req() req, @Param('id', ParseIntPipe) reservationId: number) {
    const userId = req.user.userId;
    return this.reservationsService.cancel(userId, reservationId);
  }
}

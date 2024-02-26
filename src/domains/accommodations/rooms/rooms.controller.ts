import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Partner, User } from '@prisma/client';
import { DPartner } from 'src/decorators/partner.decorator';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { day } from 'src/utils/day';
import { RoomsService } from './rooms.service';

@Controller('/accommodations/:accommodationId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/:roomId/reservations')
  @Private('user')
  makeReservation(
    @DUser() user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    return this.roomsService.makeReservation(
      user.id, //누가
      roomId, //어느방
      day(date).startOf('day').toDate(), //언제
    );
  }

  @Delete('/reservations/:reservationId/user')
  @Private('user')
  cancelReservationAsUser(
    @Param('reservationId') reservationId: string,
    @DUser() user: User,
  ) {
    return this.roomsService.cancelReservation(reservationId, user.id);
  }

  @Delete('/reservations/:reservationId/user')
  @Private('partner')
  cancelReservationAsPartner(
    @Param('reservationId') reservationId: string,
    @DPartner() partner: Partner,
  ) {
    return this.roomsService.cancelReservation(reservationId, partner.id);
  }
}

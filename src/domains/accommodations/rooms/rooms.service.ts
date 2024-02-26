import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Accommodation, Prisma, Reservation, Room } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRoom(
    accommodationId: Accommodation['id'],
    dataWithoutAccommodationId: Prisma.RoomCreateWithoutAccommodationInput,
  ) {
    console.log(accommodationId);
    const data: Prisma.RoomUncheckedCreateInput = {
      accommodationId,
      ...dataWithoutAccommodationId,
    };
    const room = await this.prismaService.room.create({ data });

    return room;
  }

  async deleteRoom(roomId: Room['id']) {
    const room = await this.prismaService.room.delete({
      where: { id: roomId },
    });

    return room;
  }

  async makeReservation(
    reservedById: Reservation['reservedById'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { reservedAt: new Date(), reservedById },
    });

    return reservation;
  }

  async cancelReservation(
    reservationId: Reservation['id'],
    partnerId?: Accommodation['partnerId'],
    userId?: Reservation['reservedById'],
  ) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
      include: { room: { include: { accommodation: true } } },
    });

    if (!reservation) throw new NotFoundException('reservation id not found');

    if (!!reservation.checkedInAt)
      throw new NotFoundException(
        'Accommodation has already been checked in cannot be cancelled',
      );

    const isUserAuthorized = userId && reservation.reservedById === userId;
    const isPartnerAuthorized =
      partnerId && reservation.room.accommodation.partnerId;

    if (isUserAuthorized || isPartnerAuthorized) {
      const deletedReservation = await this.prismaService.reservation.delete({
        where: {
          id: reservationId,
        },
      });
      return deletedReservation;
    } else {
      throw new ForbiddenException('there is no authorization');
    }
  }
}

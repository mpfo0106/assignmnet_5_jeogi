import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  Accommodation,
  AccommodationType,
  Partner,
  Prisma,
  Reservation,
  Room,
} from '@prisma/client';
import * as fs from 'fs/promises';
import { PrismaService } from './../../db/prisma/prisma.service';
import { RoomsService } from './rooms/rooms.service';
@Injectable()
export class AccommodationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}

  async createAccommodation(data: Prisma.AccommodationUncheckedCreateInput) {
    const accommodation = await this.prismaService.accommodation.create({
      data,
    });

    return accommodation;
  }

  async getAccommodations(type?: AccommodationType) {
    const accommodations = await this.prismaService.accommodation.findMany({
      where: { type },
    });

    return accommodations;
  }

  async getAccommodation(accommodationId: number) {
    const accommodations = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId },
      include: { rooms: true },
    });
    return accommodations;
  }

  async addRoomToAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    data: Parameters<typeof this.roomsService.createRoom>[1], // 그냥 Prisma.RoomCreateWithoutAccommodationInput 쓰는거보다 안전하게 사용하는법,
  ) {
    // 1.지금 요청한 partner가 숙소에 대한 소유자가 맞는지 확인.
    //아니면 돌아가~
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id }, //한번에 두개 받아서 통으로 검사
    });

    if (!accommodation) throw new ForbiddenException();

    //  2. 숙소에 방을 추가하기
    const room = await this.roomsService.createRoom(accommodationId, data);

    return room;
  }

  async addImageToAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    file: Express.Multer.File,
  ) {
    const path = `./public/${file.originalname}`;
    //프로젝트 루트기준이 .
    try {
      await fs.writeFile(path, file.buffer);
    } catch (e) {
      throw new Error('Failed to upload image');
    }

    const newImage = await this.prismaService.accommodation.update({
      where: { id: accommodationId, partnerId: partner.id },
      data: { imgUrl: path },
    });

    return newImage;
  }

  async makeCheckedInAt(
    reservationId: Reservation['id'],
    date: Reservation['date'],
  ) {
    const checkedInAt = await this.prismaService.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        checkedInAt: date,
      },
    });

    return checkedInAt;
  }

  async deleteRoomFromAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    roomId: Room['id'],
  ) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: {
        id: accommodationId,
        partnerId: partner.id,
      },
    });

    if (!accommodation) throw new ForbiddenException();

    const room = await this.roomsService.deleteRoom(roomId);

    return room;
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reservation, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { ReviewsCreateDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async makeReview(
    user: User,
    reservationId: Reservation['id'],
    dto: ReviewsCreateDto,
  ) {
    const { rating, content } = dto;
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true },
    });

    if (!reservation) throw new BadRequestException('no reservation found');

    if (user.id !== reservation.reservedById)
      throw new ForbiddenException('incorrect reservedById');

    if (!reservation.checkedInAt)
      throw new NotFoundException('Not checked in yet');

    const review = await this.prismaService.review.create({
      data: {
        userId: user.id,
        roomId: reservation.roomId,
        rating: rating,
        content: content,
      },
    });

    return review;
  }
}

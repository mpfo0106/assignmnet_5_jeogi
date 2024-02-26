import { Body, Controller, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { ReviewsCreateDto } from './reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('/:reservationId')
  @Private('user')
  makeReview(
    @DUser() user: User,
    @Param('reservationId') reservationId: string,
    @Body() dto: ReviewsCreateDto,
  ) {
    return this.reviewsService.makeReview(user, reservationId, dto);
  }
}

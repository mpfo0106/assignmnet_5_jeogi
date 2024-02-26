import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccommodationType, Partner } from '@prisma/client';
import { DPartner } from 'src/decorators/partner.decorator';
import { Private } from 'src/decorators/private.decorator';
import { day } from 'src/utils/day';
import {
  AccommodationsAddRoomDto,
  AccommodationsCreateDto as AccommodationsRegisterDto,
} from './accommodations.dto';
import { AccommodationsService } from './accommodations.service';

@Controller('accommodations')
export class AccommodationsController {
  constructor(private readonly accommodationsService: AccommodationsService) {}

  @Post()
  @Private('partner')
  registerAccommodation(
    @DPartner() partner: Partner,
    @Body() dto: AccommodationsRegisterDto,
  ) {
    return this.accommodationsService.createAccommodation({
      ...dto,
      partnerId: partner.id,
    });
  }

  @Get()
  getAccommodations(@Query('type') type?: AccommodationType) {
    //필터링 하는거니까 request쿼리로
    return this.accommodationsService.getAccommodations(type);
  }

  @Get(':accommodationId')
  getAccommodation(
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
  ) {
    return this.accommodationsService.getAccommodation(+accommodationId);
  }

  @Patch(':accommodationId')
  @Private('partner')
  updateAccommodation() {}

  @Post(':accommodationId/images')
  @Private('partner')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAccommodationMainImage(
    @DPartner() partner: Partner,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.accommodationsService.addImageToAccommodation(
      partner,
      accommodationId,
      file,
    );
    return { message: 'Image uploaded successfully' };
  }

  @Post(':accommodationId/rooms')
  @Private('partner')
  addRoom(
    @DPartner() partner: Partner,
    @Body() dto: AccommodationsAddRoomDto,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
  ) {
    return this.accommodationsService.addRoomToAccommodation(
      partner,
      accommodationId,
      dto,
    );
  }

  @Patch('/:reservationId/checkedIn')
  @Private('partner')
  makeCheckedInAt(
    @Param('reservationId') reservationId: string,
    @Body('date') date: string,
  ) {
    return this.accommodationsService.makeCheckedInAt(
      reservationId,
      day(date).startOf('day').toDate(),
    );
  }

  @Delete(':accommodationId/rooms/:roomId')
  @Private('partner')
  deleteRoom(
    @DPartner() partner: Partner,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.accommodationsService.deleteRoomFromAccommodation(
      partner,
      accommodationId,
      roomId,
    );
  }
}

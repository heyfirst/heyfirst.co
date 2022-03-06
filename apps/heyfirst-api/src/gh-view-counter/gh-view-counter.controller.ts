import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GhViewCounterService } from './gh-view-counter.service';
import { CreateGhViewCounterDto } from './dto/create-gh-view-counter.dto';
import { UpdateGhViewCounterDto } from './dto/update-gh-view-counter.dto';

@Controller('gh-view-counter')
export class GhViewCounterController {
  constructor(private readonly ghViewCounterService: GhViewCounterService) {}

  @Post()
  create(@Body() createGhViewCounterDto: CreateGhViewCounterDto) {
    return this.ghViewCounterService.create(createGhViewCounterDto);
  }

  @Get()
  findAll() {
    return this.ghViewCounterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ghViewCounterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGhViewCounterDto: UpdateGhViewCounterDto,
  ) {
    return this.ghViewCounterService.update(+id, updateGhViewCounterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ghViewCounterService.remove(+id);
  }
}

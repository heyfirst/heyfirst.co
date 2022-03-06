import { Injectable } from '@nestjs/common';
import { CreateGhViewCounterDto } from './dto/create-gh-view-counter.dto';
import { UpdateGhViewCounterDto } from './dto/update-gh-view-counter.dto';

@Injectable()
export class GhViewCounterService {
  create(createGhViewCounterDto: CreateGhViewCounterDto) {
    return 'This action adds a new ghViewCounter';
  }

  findAll() {
    return `This action returns all ghViewCounter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ghViewCounter`;
  }

  update(id: number, updateGhViewCounterDto: UpdateGhViewCounterDto) {
    return `This action updates a #${id} ghViewCounter`;
  }

  remove(id: number) {
    return `This action removes a #${id} ghViewCounter`;
  }
}

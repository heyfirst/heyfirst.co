import { PartialType } from '@nestjs/mapped-types';
import { CreateGhViewCounterDto } from './create-gh-view-counter.dto';

export class UpdateGhViewCounterDto extends PartialType(
  CreateGhViewCounterDto,
) {}

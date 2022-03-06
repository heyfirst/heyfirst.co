import { Module } from '@nestjs/common';
import { GhViewCounterService } from './gh-view-counter.service';
import { GhViewCounterController } from './gh-view-counter.controller';

@Module({
  controllers: [GhViewCounterController],
  providers: [GhViewCounterService],
})
export class GhViewCounterModule {}

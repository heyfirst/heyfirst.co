import { Test, TestingModule } from '@nestjs/testing';
import { GhViewCounterController } from './gh-view-counter.controller';
import { GhViewCounterService } from './gh-view-counter.service';

describe('GhViewCounterController', () => {
  let controller: GhViewCounterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GhViewCounterController],
      providers: [GhViewCounterService],
    }).compile();

    controller = module.get<GhViewCounterController>(GhViewCounterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

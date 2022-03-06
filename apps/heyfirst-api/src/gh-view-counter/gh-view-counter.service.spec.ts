import { Test, TestingModule } from '@nestjs/testing';
import { GhViewCounterService } from './gh-view-counter.service';

describe('GhViewCounterService', () => {
  let service: GhViewCounterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GhViewCounterService],
    }).compile();

    service = module.get<GhViewCounterService>(GhViewCounterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

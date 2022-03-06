import { Module } from '@nestjs/common';
import { BlogsModule } from './blogs/blogs.module';
import { GhViewCounterModule } from './gh-view-counter/gh-view-counter.module';

@Module({
  imports: [BlogsModule, GhViewCounterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

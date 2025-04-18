import { Module } from '@nestjs/common'
import { AstroDictionaryService } from './astro-dictionary.service'
import { AstroDictionaryController } from './astro-dictionary.controller'

@Module({
  controllers: [AstroDictionaryController],
  providers: [AstroDictionaryService],
  exports: [AstroDictionaryService],
})
export class AstroDictionaryModule {}

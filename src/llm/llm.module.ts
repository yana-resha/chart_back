import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { LlmService } from './llm.service'
import { AstroLmService } from './astro-lm.service'
import { AstroLmController } from './astro-lm.controller'

@Module({
  imports: [HttpModule],
  providers: [LlmService, AstroLmService],
  controllers: [AstroLmController],
  exports: [AstroLmService],
})
export class LlmModule {}

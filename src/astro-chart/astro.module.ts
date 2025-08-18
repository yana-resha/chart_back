import { Module } from '@nestjs/common'
import { AstroService } from './astro.service'
import { AstroController } from './astro.controller'
import { AstroDictionaryModule } from '../astro-dictionary/astro-dictionary.module'

@Module({
  imports: [AstroDictionaryModule],
  controllers: [AstroController],
  providers: [AstroService],
  exports: [AstroService],
})
export class AstroModule {}

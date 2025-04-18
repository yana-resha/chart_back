import { Module } from '@nestjs/common'
import { AstroService } from './astro.service'
import { AstroController } from './astro.controller'

@Module({
  controllers: [AstroController],
  providers: [AstroService],
  exports: [AstroService],
})
export class AstroModule {}

import { TranslateService } from './translate.service'
import { Module } from '@nestjs/common'
import { LocalityModule } from 'src/locality/locality.module'

@Module({
  providers: [TranslateService],
  imports: [LocalityModule],
  exports: [TranslateService],
})
export class TranslateModule {}

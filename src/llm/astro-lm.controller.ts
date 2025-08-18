import { Controller, Post, Body } from '@nestjs/common'
import { AstroLmService } from './astro-lm.service'
import { AstroInterpretationDto } from './dto/astro-interpret.dto'
import { AstroChartType } from 'src/common/astro/enums/chart-type.enum'

@Controller('llm/astro')
export class AstroLmController {
  constructor(private readonly astroLmService: AstroLmService) {}

  @Post('natal')
  interpretNatal(@Body() dto: AstroInterpretationDto) {
    return this.astroLmService.interpretChart(dto, AstroChartType.NATAL)
  }

  @Post('horary')
  interpretHorary(@Body() dto: AstroInterpretationDto) {
    return this.astroLmService.interpretChart(dto, AstroChartType.HORARY)
  }

  @Post('synastry')
  interpretSynastry(@Body() dto: AstroInterpretationDto) {
    return this.astroLmService.interpretChart(dto, AstroChartType.SYNASTRY)
  }
}

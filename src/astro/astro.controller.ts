import { Controller, Post, Body } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AstroService } from './astro.service'
import { FullNatalChartQueryDto } from './dto/full-natal-chart-query.dto'
import { BaseResponseDtoFactory } from 'src/common/dto/base-response.dto'
import { FullNatalChartResultDto } from './dto/full-natal-chart-result.dto'

@ApiTags('Astrology')
@Controller()
export class AstroController {
  constructor(private readonly astroService: AstroService) {}

  @Post('natal-chart')
  @ApiOperation({ summary: 'Получить натальную карту по дате и координатам' })
  @ApiResponse({
    status: 200,
    description: 'Полная натальная карта с планетами, домами, аспектами и конфигурациями',
    type: BaseResponseDtoFactory(FullNatalChartResultDto),
  })
  async getFullNatalChart(@Body() body: FullNatalChartQueryDto): Promise<FullNatalChartResultDto> {
    const { date, time, timezone, latitude, longitude } = body
    const datetime = `${date}T${time}Z`
    const chart = await this.astroService.calculateFullNatalChart(datetime, timezone, latitude, longitude)
    return chart
  }
}

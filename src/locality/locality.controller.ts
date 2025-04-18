// src/locality/locality.controller.ts
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { LocalityService } from './locality.service'
import { SearchLocalityDto } from './dto/search-locality.dto'
import { GeonamesCityResultDto } from './dto/geonames-city-result.dto'
import { BaseResponseDtoFactory } from 'src/common/dto/base-response.dto'

@ApiTags('Локалити')
@Controller('locality')
export class LocalityController {
  constructor(private readonly localityService: LocalityService) {}

  @Get('search')
  @ApiOperation({ summary: 'Поиск населенных пунктов по названию' })
  @ApiResponse({
    status: 200,
    description: 'Список населенных пунктов и их административных единиц',
    type: BaseResponseDtoFactory(GeonamesCityResultDto, true), // true для массива
  })
  async search(@Query() query: SearchLocalityDto) {
    const results = await this.localityService.findCitiesByPrefix(query.name, query.lang)
    return results
  }
}

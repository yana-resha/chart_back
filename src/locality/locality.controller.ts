// src/locality/locality.controller.ts
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { LocalityService } from './locality.service'
import { SearchLocalityDto } from './dto/search-locality.dto'
import { GeonamesCityResultDto } from './dto/geonames-city-result.dto'
import { BaseResponseDtoFactory } from 'src/common/dto/base-response.dto'
import { mapCityToResultDto } from './utils/city-mapper'
import { GEONAMES_LANGUAGES } from './types'

@ApiTags('Локалити')
@Controller('locality')
export class LocalityController {
  constructor(private readonly localityService: LocalityService) {}

  // ✅ Новый «умный» поиск
  @Get('search')
  @ApiOperation({
    summary: 'Умный поиск населённых пунктов',
    description:
      'Поиск по вхождению с ранжированием: точное/префикс/начало слова/подстрока, тип (PPLC/PPLA/...), население, place_rank, similarity, RU/EN + транслит. Поддерживает countryIso, limit, offset.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список населённых пунктов (отсортирован по релевантности)',
    type: BaseResponseDtoFactory(GeonamesCityResultDto, true),
  })
  async searchSmart(@Query() query: SearchLocalityDto) {
    const name = query.name ?? ''
    const langEnum: GEONAMES_LANGUAGES =
      (query.lang ?? 'ru') === GEONAMES_LANGUAGES.EN ? GEONAMES_LANGUAGES.EN : GEONAMES_LANGUAGES.RU
    const limit = query.limit ?? 50
    const offset = query.offset ?? 0
    const { countryIso } = query

    const rows = await this.localityService.findCitiesSmart(name, {
      lang: langEnum,
      limit,
      offset,
      countryIso,
    })

    return rows.map(mapCityToResultDto)
  }
}

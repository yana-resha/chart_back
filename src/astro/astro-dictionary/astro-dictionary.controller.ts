import { Controller, Post, Body } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AstroDictionaryService } from './astro-dictionary.service'
import { BaseResponseDtoFactory } from 'src/common/dto/base-response.dto'
import { DictionaryTextResponseDto } from './dto/dictionary-response.dto'
import { BulkDictionaryQueryDto } from './dto/dictionary-query.dto'
import { AstroDictionaryCategory, DictionaryKey } from './dictionary.types'

@ApiTags('Astrology')
@Controller()
export class AstroDictionaryController {
  constructor(private readonly dictionaryService: AstroDictionaryService) {}

  @Post('bulk')
  @ApiOperation({
    summary: 'Получить интерпретации по разным категориям',
  })
  @ApiResponse({
    status: 200,
    type: BaseResponseDtoFactory(DictionaryTextResponseDto),
  })
  getBulk(@Body() dto: BulkDictionaryQueryDto): DictionaryTextResponseDto {
    const { chart, items } = dto

    const result = (items as DictionaryKey[]).map((item) => {
      switch (item.category) {
        case AstroDictionaryCategory.PLANET_IN_SIGN: {
          const typed = item
          return {
            category: item.category,
            planet: typed.planet,
            sign: typed.sign,
            text: this.dictionaryService.getPlanetInSign(chart, typed.planet, typed.sign),
          }
        }
        case AstroDictionaryCategory.ASPECT: {
          const typed = item
          return {
            category: item.category,
            planetA: typed.planetA,
            planetB: typed.planetB,
            aspect: typed.aspect,
            text: this.dictionaryService.getAspect(chart, typed.planetA, typed.planetB, typed.aspect),
          }
        }
        case AstroDictionaryCategory.PLANET_IN_HOUSE: {
          const typed = item
          return {
            category: item.category,
            planet: typed.planet,
            house: typed.house,
            text: this.dictionaryService.getPlanetInHouse(chart, typed.planet, typed.house),
          }
        }
        case AstroDictionaryCategory.HOUSE_IN_SIGN: {
          const typed = item
          return {
            category: item.category,
            house: typed.house,
            sign: typed.sign,
            text: this.dictionaryService.getHouseInSign(chart, typed.house, typed.sign),
          }
        }
        case AstroDictionaryCategory.CONFIGURATION: {
          const typed = item
          return {
            category: item.category,
            config: typed.config,
            planets: typed.planets,
            text: this.dictionaryService.getConfiguration(chart, typed.config, typed.planets),
          }
        }
        default:
          return { ...(item as DictionaryKey), text: null }
      }
    })

    return {
      chart,
      items: result,
    }
  }
}

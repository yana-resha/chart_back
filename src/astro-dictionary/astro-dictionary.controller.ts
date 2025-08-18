import { Controller, Post, Body } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AstroDictionaryService } from './astro-dictionary.service'
import { BaseResponseDtoFactory } from 'src/common/dto/base-response.dto'

import { AstroDictionaryCategory, DictionaryKey } from './dictionary.types'
import {
  AspectQueryDto,
  BulkDictionaryQueryDto,
  ConfigurationQueryDto,
  HouseInSignQueryDto,
  PlanetInHouseQueryDto,
  PlanetInSignQueryDto,
} from './dto/dictionary-query.dto'
import {
  BulkDictionaryResponseDto,
  ConfigurationCategoryResponseDto,
  AspectCategoryResponseDto,
  HouseInSignCategoryResponseDto,
  PlanetInHouseCategoryResponseDto,
  PlanetInSignCategoryResponseDto,
} from './dto/dictionary-response.dto'

@ApiTags('Astrology')
@Controller()
export class AstroDictionaryController {
  constructor(private readonly dictionaryService: AstroDictionaryService) {}

  @Post('planet-in-sign')
  @ApiOperation({ summary: 'Получить интерпретации: планета в знаке' })
  @ApiResponse({ status: 200, type: BaseResponseDtoFactory(PlanetInSignCategoryResponseDto) })
  getPlanetInSign(@Body() body: PlanetInSignQueryDto) {
    return {
      chart: body.chart,
      items: body.items.map((item) => ({
        ...item,
        category: AstroDictionaryCategory.PLANET_IN_SIGN,
        text: this.dictionaryService.getPlanetInSign(body.chart, item.planet, item.sign),
      })),
    }
  }

  @Post('planet-in-house')
  @ApiOperation({ summary: 'Получить интерпретации: планета в доме' })
  @ApiResponse({ status: 200, type: BaseResponseDtoFactory(PlanetInHouseCategoryResponseDto) })
  getPlanetInHouse(@Body() body: PlanetInHouseQueryDto) {
    return {
      chart: body.chart,
      items: body.items.map((item) => ({
        ...item,
        category: AstroDictionaryCategory.PLANET_IN_HOUSE,
        text: this.dictionaryService.getPlanetInHouse(body.chart, item.planet, item.house),
      })),
    }
  }

  @Post('house-in-sign')
  @ApiOperation({ summary: 'Получить интерпретации: дом в знаке' })
  @ApiResponse({ status: 200, type: BaseResponseDtoFactory(HouseInSignCategoryResponseDto) })
  getHouseInSign(@Body() body: HouseInSignQueryDto) {
    return {
      chart: body.chart,
      items: body.items.map((item) => ({
        ...item,
        category: AstroDictionaryCategory.HOUSE_IN_SIGN,
        text: this.dictionaryService.getHouseInSign(body.chart, item.house, item.sign),
      })),
    }
  }

  @Post('aspect')
  @ApiOperation({ summary: 'Получить интерпретации: аспект между планетами' })
  @ApiResponse({ status: 200, type: BaseResponseDtoFactory(AspectCategoryResponseDto) })
  getAspect(@Body() body: AspectQueryDto) {
    return {
      chart: body.chart,
      items: body.items.map((item) => ({
        ...item,
        category: AstroDictionaryCategory.ASPECT,
        text: this.dictionaryService.getAspect(body.chart, item.planetA, item.planetB, item.aspect),
      })),
    }
  }

  @Post('configuration')
  @ApiOperation({ summary: 'Получить интерпретации: конфигурации планет' })
  @ApiResponse({
    status: 200,
    type: BaseResponseDtoFactory(ConfigurationCategoryResponseDto),
  })
  getConfiguration(@Body() body: ConfigurationQueryDto) {
    return {
      chart: body.chart,
      items: body.items.map((item) => {
        return {
          ...item,
          category: AstroDictionaryCategory.CONFIGURATION,
          text: this.dictionaryService.getConfiguration(body.chart, item.config, item.planets),
        }
      }),
    }
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Получить интерпретации по разным категориям',
  })
  @ApiResponse({
    status: 200,
    type: BaseResponseDtoFactory(BulkDictionaryResponseDto),
  })
  getBulk(@Body() dto: BulkDictionaryQueryDto): BulkDictionaryResponseDto {
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

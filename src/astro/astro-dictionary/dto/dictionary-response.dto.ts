import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { AspectType } from 'src/astro/types/aspect.types'
import { AstroConfigurationType } from 'src/astro/types/configuration.types'
import { AstroDictionaryCategory } from '../dictionary.types'
import { Planet_Variables, ZodiacSign } from 'src/astro/types/common.types'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'

export class HouseInSignResponseDto {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.HOUSE_IN_SIGN })
  category: AstroDictionaryCategory.HOUSE_IN_SIGN

  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign

  @ApiProperty({ example: 'Первый дом в Овне делает человека инициативным и целеустремлённым...' })
  text: string | null
}

export class PlanetInSignResponseDto {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.PLANET_IN_SIGN })
  category: AstroDictionaryCategory.PLANET_IN_SIGN

  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign

  @ApiProperty({ example: 'Солнце в Козероге делает человека целеустремлённым...' })
  text: string | null
}

export class AspectResponseDto {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.ASPECT })
  category: AstroDictionaryCategory.ASPECT

  @ApiProperty({ enum: Planet_Variables })
  planetA: Planet_Variables

  @ApiProperty({ enum: Planet_Variables })
  planetB: Planet_Variables

  @ApiProperty({ enum: AspectType })
  aspect: AspectType

  @ApiProperty({ example: 'Солнце в соединении с Луной делает натуру целостной...' })
  text: string | null
}

export class PlanetInHouseResponseDto {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.PLANET_IN_HOUSE })
  category: AstroDictionaryCategory.PLANET_IN_HOUSE

  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number

  @ApiProperty({ example: 'Марс во втором доме указывает на активное отношение к финансам...' })
  text: string | null
}

export class ConfigurationResponseDto {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.CONFIGURATION })
  category: AstroDictionaryCategory.CONFIGURATION

  @ApiProperty({ enum: AstroConfigurationType })
  config: AstroConfigurationType

  @ApiProperty({ type: [String], enum: Planet_Variables })
  planets: Planet_Variables[]

  @ApiProperty({ example: 'Конфигурация Тау-квадрат показывает внутреннее напряжение...' })
  text: string | null
}

@ApiExtraModels(
  PlanetInSignResponseDto,
  AspectResponseDto,
  PlanetInHouseResponseDto,
  ConfigurationResponseDto,
)
@ApiExtraModels(
  PlanetInSignResponseDto,
  AspectResponseDto,
  PlanetInHouseResponseDto,
  ConfigurationResponseDto,
  HouseInSignResponseDto, // 🆕
)
export class DictionaryTextResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(PlanetInSignResponseDto) },
        { $ref: getSchemaPath(AspectResponseDto) },
        { $ref: getSchemaPath(PlanetInHouseResponseDto) },
        { $ref: getSchemaPath(ConfigurationResponseDto) },
        { $ref: getSchemaPath(HouseInSignResponseDto) },
      ],
    },
  })
  items: Array<
    | PlanetInSignResponseDto
    | AspectResponseDto
    | PlanetInHouseResponseDto
    | ConfigurationResponseDto
    | HouseInSignResponseDto
  >
}

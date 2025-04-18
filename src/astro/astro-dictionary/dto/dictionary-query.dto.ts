import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'
import { AstroDictionaryCategory } from '../dictionary.types'
import { AspectType } from 'src/astro/types/aspect.types'
import { AstroConfigurationType } from 'src/astro/types/configuration.types'
import { Planet_Variables, ZodiacSign } from 'src/astro/types/common.types'

// --- Индивидуальные структуры для категорий ---

export class PlanetInSignItem {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.PLANET_IN_SIGN })
  category: AstroDictionaryCategory.PLANET_IN_SIGN

  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign
}

export class AspectItem {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.ASPECT })
  category: AstroDictionaryCategory.ASPECT

  @ApiProperty({ enum: Planet_Variables })
  planetA: Planet_Variables

  @ApiProperty({ enum: Planet_Variables })
  planetB: Planet_Variables

  @ApiProperty({ enum: AspectType })
  aspect: AspectType
}

export class PlanetInHouseItem {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.PLANET_IN_HOUSE })
  category: AstroDictionaryCategory.PLANET_IN_HOUSE

  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number
}

export class HouseInSignItem {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.HOUSE_IN_SIGN })
  category: AstroDictionaryCategory.HOUSE_IN_SIGN

  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign
}

export class ConfigurationItem {
  @ApiProperty({ enum: AstroDictionaryCategory, default: AstroDictionaryCategory.CONFIGURATION })
  category: AstroDictionaryCategory.CONFIGURATION

  @ApiProperty({ enum: AstroConfigurationType })
  config: AstroConfigurationType

  @ApiProperty({ type: [String], enum: Planet_Variables })
  planets: Planet_Variables[]
}
// --- Основной запрос DTO ---

@ApiExtraModels(PlanetInSignItem, AspectItem, PlanetInHouseItem, ConfigurationItem, HouseInSignItem)
export class BulkDictionaryQueryDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(PlanetInSignItem) },
        { $ref: getSchemaPath(AspectItem) },
        { $ref: getSchemaPath(PlanetInHouseItem) },
        { $ref: getSchemaPath(ConfigurationItem) },
        { $ref: getSchemaPath(HouseInSignItem) }, // 🆕
      ],
    },
  })
  items: Array<
    PlanetInSignItem | AspectItem | PlanetInHouseItem | ConfigurationItem | HouseInSignItem // 🆕
  >
}

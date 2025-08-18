import { ApiExtraModels, ApiProperty, getSchemaPath, IntersectionType } from '@nestjs/swagger'
import { AstroChartType } from 'src/common/astro/enums/chart-type.enum'
import {
  CategoryAspectItem,
  CategoryConfigurationItem,
  CategoryHouseInSignItem,
  CategoryPlanetInHouseItem,
  CategoryPlanetInSignItem,
} from './items.dto'

// --- Общая часть с текстом интерпретации ---
class BaseItemValue {
  @ApiProperty({ example: 'Очень яркое и импульсивное проявление…' })
  text: string | null
}

// --- DTO с категорией ---
export class HouseInSignItemResponseDto extends IntersectionType(CategoryHouseInSignItem, BaseItemValue) {}
export class PlanetInSignItemResponseDto extends IntersectionType(CategoryPlanetInSignItem, BaseItemValue) {}
export class AspectItemResponseDto extends IntersectionType(CategoryAspectItem, BaseItemValue) {}
export class PlanetInHouseItemResponseDto extends IntersectionType(
  CategoryPlanetInHouseItem,
  BaseItemValue,
) {}
export class ConfigurationItemResponseDto extends IntersectionType(
  CategoryConfigurationItem,
  BaseItemValue,
) {}

// --- DTO-ответы по категориям ---
export class ConfigurationCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [ConfigurationItemResponseDto] })
  items: ConfigurationItemResponseDto[]
}

export class PlanetInHouseCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [PlanetInHouseItemResponseDto] })
  items: PlanetInHouseItemResponseDto[]
}

export class AspectCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [AspectItemResponseDto] })
  items: AspectItemResponseDto[]
}

export class PlanetInSignCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [PlanetInSignItemResponseDto] })
  items: PlanetInSignItemResponseDto[]
}

export class HouseInSignCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [HouseInSignItemResponseDto] })
  items: HouseInSignItemResponseDto[]
}

// --- DTO для bulk-ответа с категорией и текстом ---
@ApiExtraModels(
  AspectItemResponseDto,
  ConfigurationItemResponseDto,
  HouseInSignItemResponseDto,
  PlanetInHouseItemResponseDto,
  PlanetInSignItemResponseDto,
)
export class BulkDictionaryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(AspectItemResponseDto) },
        { $ref: getSchemaPath(ConfigurationItemResponseDto) },
        { $ref: getSchemaPath(HouseInSignItemResponseDto) },
        { $ref: getSchemaPath(PlanetInHouseItemResponseDto) },
        { $ref: getSchemaPath(PlanetInSignItemResponseDto) },
      ],
    },
  })
  items: Array<
    | AspectItemResponseDto
    | ConfigurationItemResponseDto
    | HouseInSignItemResponseDto
    | PlanetInHouseItemResponseDto
    | PlanetInSignItemResponseDto
  >
}

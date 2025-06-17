import { ApiExtraModels, ApiProperty, getSchemaPath, IntersectionType } from '@nestjs/swagger'
import { Type } from '@nestjs/common'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'
import {
  CategoryAspectItem,
  CategoryConfigurationItem,
  CategoryHouseInSignItem,
  CategoryPlanetInHouseItem,
  CategoryPlanetInSignItem,
  PureAspectItem,
  PureConfigurationItem,
  PureHouseInSignItem,
  PurePlanetInHouseItem,
  PurePlanetInSignItem,
} from './items.dto'

// --- Общее значение ---
export class BaseItemValue {
  @ApiProperty({ example: 'Текст интерпретации…' })
  text: string | null
}

// --- Обобщённый тип ответа ---
export function BaseDictionaryItemResponseDto<T extends Type<any>>(Base: T) {
  return IntersectionType(Base, BaseItemValue)
}

// --- Чистые response DTO ---
export class PureHouseInSignItemResponseDto extends BaseDictionaryItemResponseDto(PureHouseInSignItem) {}
export class PurePlanetInSignItemResponseDto extends BaseDictionaryItemResponseDto(PurePlanetInSignItem) {}
export class PureAspectItemResponseDto extends BaseDictionaryItemResponseDto(PureAspectItem) {}
export class PurePlanetInHouseItemResponseDto extends BaseDictionaryItemResponseDto(PurePlanetInHouseItem) {}
export class PureConfigurationResponseDto extends BaseDictionaryItemResponseDto(PureConfigurationItem) {}

// --- Response DTO с категорией ---
export class HouseInSignItemResponseDto extends BaseDictionaryItemResponseDto(CategoryHouseInSignItem) {}
export class PlanetInSignItemResponseDto extends BaseDictionaryItemResponseDto(CategoryPlanetInSignItem) {}
export class AspectItemResponseDto extends BaseDictionaryItemResponseDto(CategoryAspectItem) {}
export class PlanetInHouseItemResponseDto extends BaseDictionaryItemResponseDto(CategoryPlanetInHouseItem) {}
export class ConfigurationItemResponseDto extends BaseDictionaryItemResponseDto(CategoryConfigurationItem) {}

// --- Генератор CategoryResponseItem<T> ---
export function createCategoryResponseItemDto<T extends Type<any>>(Base: T) {
  class TextMixin {
    @ApiProperty({ example: 'Очень яркое и импульсивное проявление…' })
    text: string
  }
  return IntersectionType(Base, TextMixin)
}

// --- Response DTO по категориям ---
export class ConfigurationCategoryResponseItem extends createCategoryResponseItemDto(PureConfigurationItem) {}
export class PlanetInHouseCategoryResponseItem extends createCategoryResponseItemDto(PurePlanetInHouseItem) {}
export class AspectCategoryResponseItem extends createCategoryResponseItemDto(PureAspectItem) {}
export class PlanetInSignCategoryResponseItem extends createCategoryResponseItemDto(PurePlanetInSignItem) {}
export class HouseInSignCategoryResponseItem extends createCategoryResponseItemDto(PureHouseInSignItem) {}

export class ConfigurationCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [ConfigurationCategoryResponseItem] })
  items: ConfigurationCategoryResponseItem[]
}

export class PlanetInHouseCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [PlanetInHouseCategoryResponseItem] })
  items: PlanetInHouseCategoryResponseItem[]
}

export class AspectCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [AspectCategoryResponseItem] })
  items: AspectCategoryResponseItem[]
}

export class PlanetInSignCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [PlanetInSignCategoryResponseItem] })
  items: PlanetInSignCategoryResponseItem[]
}

export class HouseInSignCategoryResponseDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [HouseInSignCategoryResponseItem] })
  items: HouseInSignCategoryResponseItem[]
}

// --- Response DTO для bulk запроса с категориями ---
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

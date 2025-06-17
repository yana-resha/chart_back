import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'

import {
  PurePlanetInSignItem,
  PureAspectItem,
  PurePlanetInHouseItem,
  PureConfigurationItem,
  PureHouseInSignItem,
  CategoryAspectItem,
  CategoryConfigurationItem,
  CategoryHouseInSignItem,
  CategoryPlanetInHouseItem,
  CategoryPlanetInSignItem,
} from './items.dto'

// --- Обобщённый базовый класс запроса ---
class BaseCategoryQueryDto<TItem> {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({ type: [Object] })
  items: TItem[]
}

// --- DTO для каждой категории ---

export class PlanetInSignQueryDto extends BaseCategoryQueryDto<PurePlanetInSignItem> {
  @ApiProperty({ type: [PurePlanetInSignItem] })
  items: PurePlanetInSignItem[]
}

export class AspectQueryDto extends BaseCategoryQueryDto<PureAspectItem> {
  @ApiProperty({ type: [PureAspectItem] })
  items: PureAspectItem[]
}

export class PlanetInHouseQueryDto extends BaseCategoryQueryDto<PurePlanetInHouseItem> {
  @ApiProperty({ type: [PurePlanetInHouseItem] })
  items: PurePlanetInHouseItem[]
}

export class ConfigurationQueryDto extends BaseCategoryQueryDto<PureConfigurationItem> {
  @ApiProperty({ type: [PureConfigurationItem] })
  items: PureConfigurationItem[]
}

export class HouseInSignQueryDto extends BaseCategoryQueryDto<PureHouseInSignItem> {
  @ApiProperty({ type: [PureHouseInSignItem] })
  items: PureHouseInSignItem[]
}

@ApiExtraModels(
  CategoryPlanetInSignItem,
  CategoryAspectItem,
  CategoryPlanetInHouseItem,
  CategoryConfigurationItem,
  CategoryHouseInSignItem,
)
export class BulkDictionaryQueryDto {
  @ApiProperty({ enum: AstroChartType })
  chart: AstroChartType

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(CategoryPlanetInSignItem) },
        { $ref: getSchemaPath(CategoryAspectItem) },
        { $ref: getSchemaPath(CategoryPlanetInHouseItem) },
        { $ref: getSchemaPath(CategoryConfigurationItem) },
        { $ref: getSchemaPath(CategoryHouseInSignItem) },
      ],
    },
  })
  items: Array<
    | CategoryPlanetInSignItem
    | CategoryAspectItem
    | CategoryPlanetInHouseItem
    | CategoryConfigurationItem
    | CategoryHouseInSignItem
  >
}

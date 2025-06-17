import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { AspectType } from 'src/astro/types/aspect.types'
import { Planet_Variables, ZodiacSign } from 'src/astro/types/common.types'
import { AstroConfigurationType } from 'src/astro/types/configuration.types'
import { AstroDictionaryCategory } from '../dictionary.types'

export class PurePlanetInSignItem {
  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign
}
export class PureAspectItem {
  @ApiProperty({ enum: Planet_Variables })
  planetA: Planet_Variables

  @ApiProperty({ enum: Planet_Variables })
  planetB: Planet_Variables

  @ApiProperty({ enum: AspectType })
  aspect: AspectType
}
export class PurePlanetInHouseItem {
  @ApiProperty({ enum: Planet_Variables })
  planet: Planet_Variables

  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number
}
export class PureHouseInSignItem {
  @ApiProperty({ type: Number, minimum: 1, maximum: 12 })
  house: number

  @ApiProperty({ enum: ZodiacSign })
  sign: ZodiacSign
}
export class PureConfigurationItem {
  @ApiProperty({ enum: AstroConfigurationType })
  config: AstroConfigurationType

  @ApiProperty({ type: [String], enum: Planet_Variables })
  planets: Planet_Variables[]
}
// --- Универсальный миксин-фабрикатор для добавления category ---
export function WithCategory<T extends Type<any>, C extends AstroDictionaryCategory>(
  Base: T,
  categoryValue: C,
) {
  class WithCategoryClass extends Base {
    @ApiProperty({ example: categoryValue })
    category!: C
  }
  return WithCategoryClass
}
// --- DTO с category ---
export class CategoryPlanetInSignItem extends WithCategory(
  PurePlanetInSignItem,
  AstroDictionaryCategory.PLANET_IN_SIGN,
) {}
export class CategoryAspectItem extends WithCategory(PureAspectItem, AstroDictionaryCategory.ASPECT) {}
export class CategoryPlanetInHouseItem extends WithCategory(
  PurePlanetInHouseItem,
  AstroDictionaryCategory.PLANET_IN_HOUSE,
) {}
export class CategoryConfigurationItem extends WithCategory(
  PureConfigurationItem,
  AstroDictionaryCategory.CONFIGURATION,
) {}
export class CategoryHouseInSignItem extends WithCategory(
  PureHouseInSignItem,
  AstroDictionaryCategory.HOUSE_IN_SIGN,
) {}

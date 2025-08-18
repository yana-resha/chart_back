import { AstroChartType } from 'src/common/astro/enums/chart-type.enum'
import { AstroConfigurationType } from '../astro-chart/types/configuration.types'
import { AspectType } from 'src/common/astro/enums/aspects.enum'
import { Planet_Variables } from 'src/common/astro/enums/planets.enum'
import { ZodiacSign } from 'src/common/astro/enums/zodiacs.enum'

export enum AstroDictionaryCategory {
  PLANET_IN_SIGN = 'planet-in-sign',
  PLANET_IN_HOUSE = 'planet-in-house',
  ASPECT = 'aspect',
  CONFIGURATION = 'configuration',
  HOUSE_IN_SIGN = 'house-in-sign',
}

export type PlanetName = Planet_Variables
export type AspectName = AspectType
export type ConfigName = AstroConfigurationType
export type ChartType = AstroChartType

export interface HouseInSignKey {
  category: AstroDictionaryCategory.HOUSE_IN_SIGN
  chart: ChartType
  house: number
  sign: ZodiacSign
}

export interface PlanetInSignKey {
  category: AstroDictionaryCategory.PLANET_IN_SIGN
  chart: ChartType
  planet: PlanetName
  sign: ZodiacSign
}

export interface PlanetInHouseKey {
  category: AstroDictionaryCategory.PLANET_IN_HOUSE
  chart: ChartType
  planet: PlanetName
  house: number
}

export interface AspectKey {
  category: AstroDictionaryCategory.ASPECT
  chart: ChartType
  planetA: PlanetName
  planetB: PlanetName
  aspect: AspectName
}

export interface ConfigKey {
  category: AstroDictionaryCategory.CONFIGURATION
  chart: ChartType
  config: ConfigName
  planets: PlanetName[]
}

export type DictionaryKey = PlanetInSignKey | PlanetInHouseKey | AspectKey | ConfigKey | HouseInSignKey

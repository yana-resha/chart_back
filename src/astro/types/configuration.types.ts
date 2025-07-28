import { ApiProperty } from '@nestjs/swagger'
import { AspectType } from './aspect.types'

export enum AstroConfigurationType {
  GrandTrine = 'GrandTrine', // Три планеты соединены тринами
  TSquare = 'TSquare', // Два квадрата + оппозиция между планетами
  GrandCross = 'GrandCross', // Четыре квадрата и две оппозиции
  Bisexile = 'Bisexile', // два секстиля, но между ними угол 150°
  Sail = 'Sail', // Два тригона + 1 квадрат
}

interface GrandTrineConfig {
  type: AstroConfigurationType.GrandTrine
  planets: [string, string, string] // порядок неважен
  aspects: [
    { type: AspectType.Trine; planetA: string; planetB: string },
    { type: AspectType.Trine; planetA: string; planetB: string },
    { type: AspectType.Trine; planetA: string; planetB: string },
  ]
}

interface GrandCrossConfig {
  type: AstroConfigurationType.GrandCross
  planets: [string, string, string, string]
  oppositions: [[string, string], [string, string]] // две оппозиции
  aspects: Array<{
    type: AspectType.Square | AspectType.Opposition
    planetA: string
    planetB: string
  }> // 4 квадрата + 2 оппозиции
}

interface TSquareConfig {
  type: AstroConfigurationType.TSquare
  axis: [string, string] // оппозиция
  apex: string // та, что делает два квадрата
  planets: [string, string, string]
  aspects: [
    { type: AspectType.Opposition; planetA: string; planetB: string },
    { type: AspectType.Square; planetA: string; planetB: string },
    { type: AspectType.Square; planetA: string; planetB: string },
  ]
}

interface SailConfig {
  type: AstroConfigurationType.Sail
  trine: [string, string]
  squareTo: string
  planets: [string, string, string]
  aspects: [
    { type: AspectType.Trine; planetA: string; planetB: string },
    { type: AspectType.Square; planetA: string; planetB: string },
    { type: AspectType.Square; planetA: string; planetB: string },
  ]
}

interface BisexileConfig {
  type: 'Bisexile'
  base: [string, string] // секстильная пара
  apex: string // планета с квиконсами
  planets: [string, string, string]
  aspects: [
    { type: AspectType.Sextile; planetA: string; planetB: string },
    { type: AspectType.Quincunx; planetA: string; planetB: string },
    { type: AspectType.Quincunx; planetA: string; planetB: string },
  ]
}

export class AstroConfiguration {
  @ApiProperty({ example: 'T-Square', description: 'Тип конфигурации аспектов' })
  type: string

  @ApiProperty({ example: ['Mars', 'Moon', 'Pluto'], description: 'Участники конфигурации' })
  planets: string[]
}

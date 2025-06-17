import { ApiProperty } from '@nestjs/swagger'
export enum AstroConfigurationType {
  GrandTrine = 'GrandTrine', // Три планеты соединены тринами
  TSquare = 'TSquare', // Два квадрата + оппозиция между планетами
  GrandCross = 'GrandCross', // Четыре квадрата и две оппозиции
  Bisexile = 'Bisexile', // два секстиля, но между ними угол 150°
  Sail = 'Sail', // Два тригона + 1 квадрат
}

export class AstroConfiguration {
  @ApiProperty({ example: 'T-Square', description: 'Тип конфигурации аспектов' })
  type: string

  @ApiProperty({ example: ['Mars', 'Moon', 'Pluto'], description: 'Участники конфигурации' })
  planets: string[]
}

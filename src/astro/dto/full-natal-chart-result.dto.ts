import { ApiProperty } from '@nestjs/swagger'
import { Aspect, ChartAspectStatistics, StrongestPlanet } from '../types/aspect.types'
import { AstroConfiguration } from '../types/configuration.types'
import { HouseActivityVariables, Houses, IHousesActivity, PlanetPosition } from '../types/sweph.types'
import { Type } from 'class-transformer'
import { IsString, IsNumber } from 'class-validator'

// Вложенный класс: результат расчётов
class ResultDto {
  @ApiProperty({ type: [PlanetPosition] })
  @Type(() => PlanetPosition)
  planets: PlanetPosition[]

  @ApiProperty({ type: Houses })
  @Type(() => Houses)
  houses: Houses

  @ApiProperty({
    example: {
      1: HouseActivityVariables.EMPTY,
      2: HouseActivityVariables.ACTIVE,
      // ...
    },
    description: `Возвращает ${HouseActivityVariables.EMPTY}, если дом пустой и ${HouseActivityVariables.ACTIVE}, если в доме есть хоть одна планета`,
  })
  housesActivity: IHousesActivity

  @ApiProperty({ type: [Aspect] })
  @Type(() => Aspect)
  aspects: Aspect[]

  @ApiProperty({ type: [AstroConfiguration] })
  @Type(() => AstroConfiguration)
  configurations: AstroConfiguration[]

  @ApiProperty({ type: StrongestPlanet })
  @Type(() => StrongestPlanet)
  strongestPlanet: StrongestPlanet

  @ApiProperty({ type: ChartAspectStatistics })
  @Type(() => ChartAspectStatistics)
  chartAspectStatistics: ChartAspectStatistics
}

// Входные данные
class SourceDataDto {
  @ApiProperty({ example: '2025-06-21T12:00:00' })
  @IsString()
  datetime: string

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  timezone: number

  @ApiProperty({ example: 55.7558 })
  @Type(() => Number)
  @IsNumber()
  latitude: number

  @ApiProperty({ example: 37.6173 })
  @Type(() => Number)
  @IsNumber()
  longitude: number
}

// Финальный DTO
export class FullNatalChartResultDto {
  @ApiProperty({ type: SourceDataDto })
  @Type(() => SourceDataDto)
  sourceData: SourceDataDto

  @ApiProperty({ type: ResultDto })
  @Type(() => ResultDto)
  result: ResultDto
}

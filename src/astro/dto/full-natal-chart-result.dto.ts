import { ApiProperty } from '@nestjs/swagger'
import { Aspect, EvaluateChartStrength, StrongestPlanet } from '../types/aspect.types'
import { AstroConfiguration } from '../types/configuration.types'
import { HouseActivityVariables, Houses, IHousesActivity, PlanetPosition } from '../types/sweph.types'

export class FullNatalChartResultDto {
  @ApiProperty({ type: [PlanetPosition] })
  planets: PlanetPosition[]

  @ApiProperty({ type: Houses })
  houses: Houses

  @ApiProperty({
    example: {
      1: HouseActivityVariables.EMPTY,
      2: HouseActivityVariables.ACTIVE,
      3: HouseActivityVariables.ACTIVE,
      4: HouseActivityVariables.ACTIVE,
      5: HouseActivityVariables.ACTIVE,
      6: HouseActivityVariables.ACTIVE,
      7: HouseActivityVariables.EMPTY,
      8: HouseActivityVariables.ACTIVE,
      9: HouseActivityVariables.ACTIVE,
      10: HouseActivityVariables.ACTIVE,
      11: HouseActivityVariables.ACTIVE,
      12: HouseActivityVariables.EMPTY,
    },
    description: `Возвращает ${HouseActivityVariables.EMPTY}, если дом пустой и ${HouseActivityVariables.ACTIVE} если в доме есть хоть одна планета`,
  })
  housesActivity: IHousesActivity

  @ApiProperty({ type: [Aspect] })
  aspects: Aspect[]

  @ApiProperty({ type: [AstroConfiguration] })
  configurations: AstroConfiguration[]

  @ApiProperty({ type: StrongestPlanet })
  strongestPlanet: StrongestPlanet

  @ApiProperty({ type: EvaluateChartStrength })
  chartStrength: EvaluateChartStrength
}

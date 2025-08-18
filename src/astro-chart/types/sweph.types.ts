import { ApiProperty } from '@nestjs/swagger'
import {
  SE_CHIRON,
  SE_JUPITER,
  SE_MARS,
  SE_MEAN_APOG,
  SE_MERCURY,
  SE_MOON,
  SE_NEPTUNE,
  SE_PLUTO,
  SE_PROSERPINA,
  SE_SATURN,
  SE_SUN,
  SE_TRUE_NODE,
  SE_URANUS,
  SE_VENUS,
} from 'swisseph'
import { House_System } from 'src/common/astro/enums/houses.enum'
import { Planet_Variables } from 'src/common/astro/enums/planets.enum'

export const Planets: Record<Planet_Variables, number> = {
  [Planet_Variables.Sun]: SE_SUN,
  [Planet_Variables.Moon]: SE_MOON,
  [Planet_Variables.Mercury]: SE_MERCURY,
  [Planet_Variables.Venus]: SE_VENUS,
  [Planet_Variables.Mars]: SE_MARS,
  [Planet_Variables.Jupiter]: SE_JUPITER,
  [Planet_Variables.Saturn]: SE_SATURN,
  [Planet_Variables.Uranus]: SE_URANUS,
  [Planet_Variables.Neptune]: SE_NEPTUNE,
  [Planet_Variables.Pluto]: SE_PLUTO,

  [Planet_Variables.Proserpina]: SE_PROSERPINA,
  [Planet_Variables.Chiron]: SE_CHIRON,
  [Planet_Variables.Lilith]: SE_MEAN_APOG,
  [Planet_Variables.Ketu]: SE_TRUE_NODE, // Южный узел будет вычисляться как Rahu + 180°
  [Planet_Variables.Rahu]: SE_TRUE_NODE,
  [Planet_Variables.Fortuna]: -1,
  [Planet_Variables.Selena]: -2,
}

// Это планеты которые я рассчитываю не по эфемеридам, не трогать их для других целей!
export const FICTITIOUS_PLANETS: string[] = [
  Planet_Variables.Ketu,
  Planet_Variables.Fortuna,
  Planet_Variables.Selena,
]

export type Planet = keyof typeof Planets

export class PlanetPosition {
  @ApiProperty({ example: 'Sun' })
  name: string

  @ApiProperty({ example: 123.45, description: 'Геоцентрическая долгота в градусах' })
  longitude: number

  @ApiProperty({ example: 0.0, description: 'Геоцентрическая широта (чаще всего 0)' })
  latitude: number

  @ApiProperty({ example: 1.0, description: 'Расстояние от Земли в астрономических единицах' })
  distance: number

  @ApiProperty({ example: 0.9876, description: 'Скорость планеты в градусах/день' })
  speed: number

  @ApiProperty({ example: true, description: 'Ретроградность (Является ли скорость планеты отрицательной)' })
  isRetrograde: boolean
}

// --- Типы систем домов ---
export const SwephHouseSystem = {
  [House_System.Placidus]: 'P',
  [House_System.Koch]: 'K',
  [House_System.Porphyry]: 'O',
  [House_System.Regiomontanus]: 'R',
  [House_System.Campanus]: 'C',
  [House_System.EqualMC]: 'V', // равнодомная от MC
  [House_System.EqualAsc]: 'E', // равнодомная от Asc
}

export type SwephCode = (typeof SwephHouseSystem)[House_System]

export class Houses {
  @ApiProperty({ example: 128.32491338495782, description: 'Асцендент' })
  ascendant: number
  @ApiProperty({ example: 16.43104157825828, description: 'MC (середина неба)' })
  midheaven: number
  @ApiProperty({
    example: [
      128.32491338495782, 144.8692670793579, 166.41983171657319, 196.4310415782583, 236.6473698624604,
      277.40856096068944, 308.3249133849578, 324.8692670793579, 346.4198317165732, 16.43104157825828,
      56.647369862460415, 97.40856096068944,
    ],
    description: 'Куспиды 12 домов, координаты',
  })
  houses: number[]
}

export enum HouseActivityVariables {
  EMPTY = 'empty',
  ACTIVE = 'active',
}

export interface IHousesActivity {
  [key: number]: HouseActivityVariables
}

export interface AstroCalculationSourceData {
  datetime: string
  timezone: number
  latitude: number
  longitude: number
  jd: number
  hsys: House_System
  place?: string
  name?: string
}

export interface AstroCalculationValue {
  planets: PlanetPosition[]
  houses: Houses
  housesActivity: IHousesActivity
}

export interface AstroCalculationResult {
  sourceData: AstroCalculationSourceData
  result: AstroCalculationValue
}

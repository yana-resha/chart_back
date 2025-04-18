import { IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AstroInterpretationDto {
  @ApiProperty({
    example: {
      date: '1995-01-11',
      time: '18:55:00',
      timezone: 5,
      latitude: 52.7667,
      longitude: 55.7833,
    },
  })
  @IsObject()
  userData: {
    date: string
    time: string
    timezone: number
    latitude: number
    longitude: number
  }

  @ApiProperty({
    description: 'Астрологические расчёты: планеты, дома, аспекты и пр.',
    example: {
      planets: [
        {
          name: 'Sun',
          longitude: 123.45,
          latitude: 0,
          distance: 1,
          speed: 0.9876,
          isRetrograde: true,
        },
      ],
      houses: {
        ascendant: 128.32,
        midheaven: 16.43,
        houses: [128.32, 144.86, 166.42, 196.43, 236.65, 277.41, 308.32, 324.87, 346.42, 16.43, 56.65, 97.41],
      },
      aspects: [
        {
          planetA: 'Sun',
          planetB: 'Moon',
          aspectType: 'Conjunction',
          orb: 0.85,
          isExact: true,
          isVeryExact: false,
          angle: true,
          strength: 0.92,
        },
      ],
      chartStrength: {
        score: 80,
        label: 'strong',
      },
    },
  })
  @IsObject()
  calculations: any
}

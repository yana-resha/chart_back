import { Matches, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FullNatalChartQueryDto {
  @ApiProperty({ example: '1995-01-11' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата должна быть в формате YYYY-MM-DD' })
  date: string

  @ApiProperty({ example: '18:55:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Время должно быть в формате HH:MM:SS',
  })
  time: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(-12)
  @Max(14)
  timezone: number

  @ApiProperty({ example: 52.7667 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ example: 55.7833 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number
}

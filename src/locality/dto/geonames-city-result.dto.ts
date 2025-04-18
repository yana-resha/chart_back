// src/locality/dto/geonames-city-result.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export class Admin2Dto {
  @ApiProperty({ example: '123456', description: 'GeoNames ID административной единицы 2-го уровня' })
  geonameid: string

  @ApiProperty({
    example: 'Bashkia Fier',
    description: 'Оригинальное название административной единицы (ASCII)',
  })
  asciiname: string

  @ApiProperty({ example: 'Фиер', description: 'Название административной единицы на русском языке' })
  asciiname_ru: string
}

export class Admin1Dto {
  @ApiProperty({ example: 789012, description: 'GeoNames ID административной единицы 1-го уровня' })
  geonameid: number

  @ApiProperty({ example: 'Fier', description: 'Оригинальное название административной единицы (ASCII)' })
  asciiname: string

  @ApiProperty({ example: 'Фиер', description: 'Название административной единицы на русском языке' })
  asciiname_ru: string
}

export class CountryDto {
  @ApiProperty({ example: 'AL', description: 'ISO-код страны' })
  iso: string

  @ApiProperty({ example: 'Albania', description: 'Название страны на английском языке' })
  name: string

  @ApiProperty({ example: 'Албания', description: 'Название страны на русском языке' })
  name_ru: string
}

export class CityDto {
  @ApiProperty({ example: '3183875', description: 'GeoNames ID города' })
  geonameid: string

  @ApiProperty({ example: 'Fier', description: 'Оригинальное название города (ASCII)' })
  asciiname: string

  @ApiProperty({ example: 'Фиер', description: 'Название города на русском языке' })
  asciiname_ru: string

  @ApiProperty({ example: '40.7239', description: 'Широта города' })
  latitude: string

  @ApiProperty({ example: '19.5561', description: 'Долгота города' })
  longitude: string

  @ApiProperty({ example: 15, description: 'Высота над уровнем моря в метрах', nullable: true })
  elevation: number

  @ApiProperty({ example: 'AL', description: 'ISO-код страны', nullable: true })
  country: string

  @ApiProperty({
    example: 784756,
    description: 'GeoNames ID административной единицы 1-го уровня',
    nullable: true,
  })
  admin1_id: number

  @ApiProperty({
    example: 3183874,
    description: 'GeoNames ID административной единицы 2-го уровня',
    nullable: true,
  })
  admin2_id: number

  @ApiProperty({ example: 'Europe/Tirane', description: 'Часовой пояс города', nullable: true })
  time_zone: string
}

export class GeonamesCityResultDto extends CityDto {
  @ApiProperty({
    type: () => Admin2Dto,
    nullable: true,
    description: 'Данные об административной единице 2-го уровня',
  })
  admin2_data?: Admin2Dto

  @ApiProperty({
    type: () => Admin1Dto,
    nullable: true,
    description: 'Данные об административной единице 1-го уровня',
  })
  admin1_data?: Admin1Dto

  @ApiProperty({ type: () => CountryDto, nullable: true, description: 'Данные о стране' })
  country_data?: CountryDto
}

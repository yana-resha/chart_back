// src/locality/dto/geonames-city-result.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export class Admin2Dto {
  @ApiProperty({ example: 'US.CA.037', description: 'GeoNames ID admin2 (строка вида CC.A1.A2)' })
  geonameid: string

  @ApiProperty({ example: 'Los Angeles County', description: 'Оригинальное название (ASCII)' })
  asciiname: string

  @ApiProperty({ example: 'Округ Лос-Анджелес', description: 'Название на русском' })
  asciiname_ru: string
}

export class Admin1Dto {
  @ApiProperty({ example: 'US.CA', description: 'GeoNames ID admin1 (строка вида CC.A1)' })
  geonameid: string

  @ApiProperty({ example: 'California', description: 'Оригинальное название (ASCII)' })
  asciiname: string

  @ApiProperty({ example: 'Калифорния', description: 'Название на русском' })
  asciiname_ru: string
}

export class CountryDto {
  @ApiProperty({ example: 'US', description: 'ISO-код страны' })
  iso: string

  @ApiProperty({ example: 'United States', description: 'Название на английском языке' })
  name: string

  @ApiProperty({ example: 'США', description: 'Название на русском языке' })
  name_ru: string
}

export class CityDto {
  @ApiProperty({ example: '5128581', description: 'GeoNames ID города' })
  geonameid: string

  @ApiProperty({ example: 'New York', description: 'Оригинальное название (ASCII)' })
  asciiname: string

  @ApiProperty({ example: 'Нью-Йорк', description: 'Название на русском', nullable: true })
  asciiname_ru: string | null

  @ApiProperty({ example: 40.7128, description: 'Широта', nullable: true })
  latitude: number | null

  @ApiProperty({ example: -74.0061, description: 'Долгота', nullable: true })
  longitude: number | null

  @ApiProperty({ example: 10, description: 'Высота над уровнем моря, м', nullable: true })
  elevation: number | null

  @ApiProperty({ example: 12, description: 'DEM высота, м', nullable: true })
  dem: number | null

  @ApiProperty({ example: 8804190, description: 'Население', nullable: true })
  population: number | null

  @ApiProperty({ example: 'US', description: 'ISO-код страны', nullable: true })
  country: string | null

  @ApiProperty({ example: 'US.CA', description: 'GeoNames admin1 ID (строка)', nullable: true })
  admin1_id: string | null

  @ApiProperty({ example: 'US.CA.037', description: 'GeoNames admin2 ID (строка)', nullable: true })
  admin2_id: string | null

  @ApiProperty({ example: 'Europe/Moscow', description: 'Часовой пояс (IANA)', nullable: true })
  time_zone: string | null

  @ApiProperty({ example: 'PPL', description: 'Код типа объекта (feature_code)', nullable: true })
  feature_code: string | null

  @ApiProperty({ example: 80, description: 'Ранг приоритета места', nullable: true })
  place_rank: number | null

  @ApiProperty({
    example: '2024-11-29',
    description: 'Дата последней модификации записи в GeoNames (DATEONLY)',
    nullable: true,
    format: 'date',
  })
  modification_date: string | null
}

export class GeonamesCityResultDto extends CityDto {
  @ApiProperty({ type: () => Admin2Dto, nullable: true, description: 'Данные admin2' })
  admin2_data: Admin2Dto | null

  @ApiProperty({ type: () => Admin1Dto, nullable: true, description: 'Данные admin1' })
  admin1_data: Admin1Dto | null

  @ApiProperty({ type: () => CountryDto, nullable: true, description: 'Данные о стране' })
  country_data: CountryDto | null
}

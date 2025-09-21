// src/locality/dto/search-locality.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { GEONAMES_LANGUAGES } from '../types'

export class SearchLocalityDto {
  @ApiPropertyOptional({ description: 'Строка поиска (город/посёлок и т.п.)', example: 'mosc', default: '' })
  @IsString()
  @IsOptional()
  name?: string = ''

  @ApiPropertyOptional({
    description: 'Язык поиска',
    enum: GEONAMES_LANGUAGES,
    default: GEONAMES_LANGUAGES.RU,
  })
  @IsIn(Object.values(GEONAMES_LANGUAGES))
  @IsOptional()
  lang?: GEONAMES_LANGUAGES = GEONAMES_LANGUAGES.RU

  @ApiPropertyOptional({ description: 'ISO страны для ограничения поиска', example: 'RU' })
  @IsString()
  @IsOptional()
  countryIso?: string

  @ApiPropertyOptional({ description: 'Лимит результатов (1..200)', default: 50, minimum: 1, maximum: 200 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 50

  @ApiPropertyOptional({ description: 'Смещение результатов', default: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0
}

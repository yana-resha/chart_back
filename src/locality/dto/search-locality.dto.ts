import { IsString, IsOptional, IsIn, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { GEONAMES_LANGUAGES } from '../types'

export class SearchLocalityDto {
  @ApiProperty({ description: 'Название населенного пункта (минимум 3 символа)' })
  @IsString()
  @MinLength(3, { message: 'Название должно содержать минимум 3 символа' })
  name: string

  @ApiProperty({
    description: `Язык поиска: ${GEONAMES_LANGUAGES.RU} (по умолчанию) или ${GEONAMES_LANGUAGES.EN}`,
    enum: GEONAMES_LANGUAGES,
    required: false,
    default: GEONAMES_LANGUAGES.RU,
  })
  @IsOptional()
  @IsIn([GEONAMES_LANGUAGES.EN, GEONAMES_LANGUAGES.RU])
  lang?: GEONAMES_LANGUAGES.RU | GEONAMES_LANGUAGES.EN = GEONAMES_LANGUAGES.RU
}

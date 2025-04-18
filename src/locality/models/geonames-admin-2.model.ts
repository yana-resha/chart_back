// geonames-admin2.model.ts
import { BelongsTo, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { ApiProperty } from '@nestjs/swagger'
import { GeonamesAdmin1 } from './geonames-admin-1.model'
import { GeonamesCountry } from './geonames-country.model'
import { GeonamesCity } from './geonames-city.model'

@Table({
  tableName: 'geonames_admin_2',
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
})
export class GeonamesAdmin2 extends Model<GeonamesAdmin2> {
  @ApiProperty({ example: 'US.01.001', description: 'Уникальный идентификатор GeoNames для округа (admin2)' })
  @Column({ type: DataType.STRING, primaryKey: true })
  geonameid: string

  @ApiProperty({ example: 'Los Angeles County', description: 'Название административного округа (ASCII)' })
  @Column({ type: DataType.STRING })
  asciiname: string

  @ApiProperty({
    example: 'Округ Лос-Анджелес',
    description: 'Название административного округа на русском языке',
  })
  @Column({ type: DataType.STRING })
  asciiname_ru: string

  @ApiProperty({ example: 'US', description: 'Двухбуквенный код страны (ISO 3166-1 alpha-2)' })
  @Column({ type: DataType.STRING })
  country: string

  @ApiProperty({
    example: 'US.01',
    description: 'Уникальный идентификатор GeoNames для региона уровнем выше (admin1)',
  })
  @Column({ type: DataType.STRING })
  admin1_id: string

  // Связь с admin1
  @BelongsTo(() => GeonamesAdmin1, {
    foreignKey: 'admin1_id',
    targetKey: 'geonameid',
    constraints: false,
  })
  admin1_data: GeonamesAdmin1

  // 👉 Связь со страной
  @BelongsTo(() => GeonamesCountry, {
    foreignKey: 'country',
    targetKey: 'iso',
    constraints: false,
  })
  country_data: GeonamesCountry
  // обратные связи

  @HasMany(() => GeonamesCity, { foreignKey: 'admin1_id', sourceKey: 'geonameid' })
  cities: GeonamesCity[]
}

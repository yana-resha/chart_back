import { BelongsTo, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { ApiProperty } from '@nestjs/swagger'
import { GeonamesCountry } from './geonames-country.model'
import { GeonamesAdmin2 } from './geonames-admin-2.model'
import { GeonamesCity } from './geonames-city.model'

@Table({
  tableName: 'geonames_admin_1',
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
})
export class GeonamesAdmin1 extends Model<GeonamesAdmin1> {
  @ApiProperty({ example: 'US.01', description: 'Уникальный идентификатор GeoNames для региона' })
  @Column({ type: DataType.STRING, primaryKey: true })
  geonameid: string

  @ApiProperty({ example: 'California', description: 'Название региона (ASCII)' })
  @Column({ type: DataType.STRING })
  asciiname: string

  @ApiProperty({ example: 'Калифорния', description: 'Название региона на русском языке' })
  @Column({ type: DataType.STRING })
  asciiname_ru: string

  @ApiProperty({ example: 'US', description: 'Двухбуквенный код страны (ISO 3166-1 alpha-2)' })
  @Column({ type: DataType.STRING })
  country: string

  // 👉 Связь со страной
  @BelongsTo(() => GeonamesCountry, {
    foreignKey: 'country',
    targetKey: 'iso',
    constraints: false,
  })
  country_data: GeonamesCountry

  // обратные связи

  @HasMany(() => GeonamesAdmin2, {
    foreignKey: 'admin1_id',
    sourceKey: 'geonameid',
  })
  admin2Regions: GeonamesAdmin2[]

  @HasMany(() => GeonamesCity, {
    foreignKey: 'admin1_id', // Используем правильное поле для связи
    sourceKey: 'geonameid',
  })
  cities: GeonamesCity[]
}

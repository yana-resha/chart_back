import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { GeonamesAdmin1 } from './geonames-admin-1.model'
import { GeonamesAdmin2 } from './geonames-admin-2.model'
import { GeonamesCity } from './geonames-city.model'

@Table({
  tableName: 'geonames_country',
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
})
export class GeonamesCountry extends Model<GeonamesCountry> {
  @ApiProperty({ example: 'RU', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  iso: string
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({
    example: 'Russia',
    description: 'Название страны на английском',
  })
  name: string
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({
    example: 'Россия',
    description: 'Название страны на русском',
  })
  name_ru: string

  // 👉 связи

  @HasMany(() => GeonamesAdmin1, {
    foreignKey: 'country',
    sourceKey: 'iso',
  })
  admin1Regions: GeonamesAdmin1[]

  @HasMany(() => GeonamesAdmin2, {
    foreignKey: 'country',
    sourceKey: 'iso',
  })
  admin2Regions: GeonamesAdmin2[]

  @HasMany(() => GeonamesCity, {
    foreignKey: 'country',
    sourceKey: 'iso',
  })
  cities: GeonamesCity[]
}

import { BelongsTo, Column, DataType, Model, Table } from 'sequelize-typescript'
import { ApiProperty } from '@nestjs/swagger'
import { GeonamesAdmin2 } from './geonames-admin-2.model'
import { GeonamesAdmin1 } from './geonames-admin-1.model'
import { GeonamesCountry } from './geonames-country.model'

@Table({
  tableName: 'geonames_city',
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
})
export class GeonamesCity extends Model<GeonamesCity> {
  @ApiProperty({ example: '123456', description: 'Уникальный идентификатор GeoNames' })
  @Column({ type: DataType.STRING, primaryKey: true })
  geonameid: string

  @ApiProperty({ example: 'Moscow', description: 'Название населённого пункта (ASCII)' })
  @Column({ type: DataType.STRING })
  asciiname: string

  @ApiProperty({ example: 'Москва', description: 'Название населённого пункта на русском' })
  @Column({ type: DataType.STRING })
  asciiname_ru: string

  @ApiProperty({ example: 55.7558, description: 'Широта' })
  @Column({ type: DataType.DECIMAL })
  latitude: number

  @ApiProperty({ example: 37.6176, description: 'Долгота' })
  @Column({ type: DataType.DECIMAL })
  longitude: number

  @ApiProperty({ example: 156, description: 'Высота над уровнем моря в метрах' })
  @Column({ type: DataType.INTEGER })
  elevation: number

  @ApiProperty({ example: 'RU', description: 'Двухбуквенный код страны (ISO 3166-1 alpha-2)' })
  @Column({ type: DataType.STRING })
  country: string

  @ApiProperty({ example: 'AD.02', description: 'Код региона первого уровня (admin1)' })
  @Column({ type: DataType.STRING })
  admin1_id: string

  @ApiProperty({ example: 'AD.02.001', description: 'Код региона второго уровня (admin2)' })
  @Column({ type: DataType.STRING })
  admin2_id: string

  @ApiProperty({ example: 'Europe/Moscow', description: 'Часовой пояс' })
  @Column({ type: DataType.STRING })
  time_zone: string

  // 👉 Связь с admin2 (по admin2 → geonameid)
  @BelongsTo(() => GeonamesAdmin2, {
    foreignKey: 'admin2_id',
    targetKey: 'geonameid',
    constraints: false,
  })
  admin2_data: GeonamesAdmin2

  // 👉 Связь с admin1 (через admin2 → admin1_data)
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
}

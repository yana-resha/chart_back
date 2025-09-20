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
  geonameid!: string

  @ApiProperty({ example: 'Moscow', description: 'Название населённого пункта (ASCII)' })
  @Column({ type: DataType.STRING, allowNull: false })
  asciiname!: string

  @ApiProperty({ example: 'Москва', description: 'Название населённого пункта на русском' })
  @Column({ type: DataType.STRING, allowNull: true })
  asciiname_ru!: string | null

  @ApiProperty({ example: 'München', description: 'Оригинальное локальное название (c диакритикой)' })
  @Column({ type: DataType.STRING, allowNull: true })
  name_local!: string | null

  @ApiProperty({ example: 55.7558, description: 'Широта' })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  latitude!: number | null

  @ApiProperty({ example: 37.6176, description: 'Долгота' })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  longitude!: number | null

  @ApiProperty({ example: 156, description: 'Высота над уровнем моря, м (из GeoNames elevation)' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  elevation!: number | null

  @ApiProperty({ example: 170, description: 'DEM (SRTM) высота, м (fallback, если elevation пуст)' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  dem!: number | null

  @ApiProperty({ example: 12615882, description: 'Численность населения' })
  @Column({ type: DataType.BIGINT, allowNull: true })
  population!: number | null

  @ApiProperty({ example: 'RU', description: 'Код страны (ISO 3166-1 alpha-2)' })
  @Column({ type: DataType.STRING, allowNull: true })
  country!: string | null

  @ApiProperty({ example: 'RU.MOW', description: 'Идентификатор admin1 (CC.A1)' })
  @Column({ type: DataType.STRING, allowNull: true })
  admin1_id!: string | null

  @ApiProperty({ example: 'RU.MOW.001', description: 'Идентификатор admin2 (CC.A1.A2)' })
  @Column({ type: DataType.STRING, allowNull: true })
  admin2_id!: string | null

  @ApiProperty({ example: 'Europe/Moscow', description: 'Часовой пояс (IANA)' })
  @Column({ type: DataType.STRING, allowNull: true })
  time_zone!: string | null

  @ApiProperty({ example: 'PPLC', description: 'Код типа объекта (feature_code)' })
  @Column({ type: DataType.STRING, allowNull: true })
  feature_code!: string | null

  @ApiProperty({ example: '2024-11-29', description: 'Дата последней модификации в GeoNames' })
  @Column({ type: DataType.DATEONLY, allowNull: true })
  modification_date!: string | Date | null

  @ApiProperty({ example: 100, description: 'Ранг приоритета места (столицы/адм.центры выше)' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  place_rank!: number | null

  // 👉 Связи
  @BelongsTo(() => GeonamesAdmin2, {
    foreignKey: 'admin2_id',
    targetKey: 'geonameid',
    constraints: false,
  })
  admin2_data!: GeonamesAdmin2

  @BelongsTo(() => GeonamesAdmin1, {
    foreignKey: 'admin1_id',
    targetKey: 'geonameid',
    constraints: false,
  })
  admin1_data!: GeonamesAdmin1

  @BelongsTo(() => GeonamesCountry, {
    foreignKey: 'country',
    targetKey: 'iso',
    constraints: false,
  })
  country_data!: GeonamesCountry
}

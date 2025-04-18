import { Sequelize } from 'sequelize'

export function getCitySortOrder(lang: 'ru' | 'en'): any[] {
  return [
    [Sequelize.literal(`CASE WHEN "GeonamesCity"."country" = 'RU' THEN 0 ELSE 1 END`), 'ASC'],
    ['country', 'ASC'],
    ['admin1_id', 'ASC'],
    ['admin2_id', 'ASC'],
    [lang === 'ru' ? 'asciiname_ru' : 'asciiname', 'ASC'],
  ]
}

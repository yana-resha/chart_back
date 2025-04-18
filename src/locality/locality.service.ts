import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { GeonamesCity } from './models/geonames-city.model'
import { GeonamesAdmin2 } from './models/geonames-admin-2.model'
import { GeonamesAdmin1 } from './models/geonames-admin-1.model'
import { GeonamesCountry } from './models/geonames-country.model'
import { getCitySortOrder } from './utils/sort-utils'

@Injectable()
export class LocalityService {
  constructor(
    @InjectModel(GeonamesCity)
    private readonly cityModel: typeof GeonamesCity,
  ) {}

  async findCitiesByPrefix(prefix: string, lang: 'ru' | 'en' = 'ru'): Promise<GeonamesCity[]> {
    const whereClause =
      lang === 'ru'
        ? { asciiname_ru: { [Op.iLike]: `${prefix}%` } }
        : { asciiname: { [Op.iLike]: `${prefix}%` } }

    const cities = await this.cityModel.findAll({
      where: whereClause,
      include: [
        {
          model: GeonamesAdmin2,
          as: 'admin2_data',
        },
        {
          model: GeonamesAdmin1,
          as: 'admin1_data',
        },
        {
          model: GeonamesCountry,
          as: 'country_data',
        },
      ],
      order: getCitySortOrder(lang),
    })

    return cities
  }
}

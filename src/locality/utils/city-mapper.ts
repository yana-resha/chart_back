// src/locality/utils/city-mapper.ts
import { GeonamesCity } from '../models/geonames-city.model'
import { GeonamesCityResultDto } from '../dto/geonames-city-result.dto'

function toDateOnlyString(d: string | Date | null): string | null {
  if (!d) return null
  if (typeof d === 'string') return d // ожидаем 'YYYY-MM-DD' от DATEONLY
  // На всякий случай, если придёт Date:
  return d.toISOString().slice(0, 10)
}

export function mapCityToResultDto(city: GeonamesCity): GeonamesCityResultDto {
  return {
    geonameid: city.geonameid,
    asciiname: city.asciiname,
    asciiname_ru: city.asciiname_ru ?? null,
    latitude: city.latitude ?? null,
    longitude: city.longitude ?? null,
    elevation: city.elevation ?? null,
    dem: city.dem ?? null,
    population: city.population ?? null,
    country: city.country ?? null,
    admin1_id: city.admin1_id ?? null,
    admin2_id: city.admin2_id ?? null,
    time_zone: city.time_zone ?? null,
    feature_code: city.feature_code ?? null,
    place_rank: city.place_rank ?? null,
    modification_date: toDateOnlyString(city.modification_date),

    country_data: city.country_data
      ? {
          iso: city.country_data.iso,
          name: city.country_data.name,
          name_ru: city.country_data.name_ru ?? null,
        }
      : null,

    admin1_data: city.admin1_data
      ? {
          geonameid: city.admin1_data.geonameid,
          asciiname: city.admin1_data.asciiname,
          asciiname_ru: city.admin1_data.asciiname_ru ?? null,
        }
      : null,

    admin2_data: city.admin2_data
      ? {
          geonameid: city.admin2_data.geonameid,
          asciiname: city.admin2_data.asciiname,
          asciiname_ru: city.admin2_data.asciiname_ru ?? null,
        }
      : null,
  }
}

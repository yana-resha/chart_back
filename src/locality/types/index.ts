export enum GEONAMES_LANGUAGES {
  RU = 'ru',
  EN = 'en',
}
export interface FindCitiesSmartOpts {
  lang?: GEONAMES_LANGUAGES
  limit?: number
  offset?: number
  countryIso?: string // опционально фильтрануть по стране
}

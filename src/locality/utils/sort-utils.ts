// src/locality/utils/sort-utils.ts
import { literal } from 'sequelize'

type Lang = 'ru' | 'en'

export function buildSmartOrder(opts: { qEscaped: string; lang: Lang; alias: string }) {
  const { qEscaped, lang, alias } = opts
  const col = lang === 'ru' ? `${alias}."asciiname_ru"` : `${alias}."asciiname"`
  const nameLocal = `${alias}."name_local"`
  const admin1 = `"admin1_data"."asciiname"`
  const admin2 = `"admin2_data"."asciiname"`
  const country = `"country_data"."name"`
  const countryRu = `"country_data"."name_ru"`

  return literal(`
    (
      (CASE WHEN public.immutable_unaccent(${col}) = public.immutable_unaccent(${qEscaped}) THEN 200 ELSE 0 END) +
      (CASE WHEN public.immutable_unaccent(${col}) LIKE public.immutable_unaccent(${qEscaped}) || '%' THEN 120 ELSE 0 END) +
      (CASE WHEN public.immutable_unaccent(${col}) ~* ('\\m' || regexp_replace(public.immutable_unaccent(${qEscaped}), '\\W+', '', 'g')) THEN 90 ELSE 0 END) +
      (CASE WHEN public.immutable_unaccent(${col}) LIKE '%' || public.immutable_unaccent(${qEscaped}) || '%' THEN 60 ELSE 0 END) +
      (
        CASE ${alias}."feature_code"
          WHEN 'PPLC' THEN 100
          WHEN 'PPLA' THEN 80
          WHEN 'PPLA2' THEN 70
          WHEN 'PPLA3' THEN 60
          WHEN 'PPLA4' THEN 50
          WHEN 'PPL'  THEN 40
          WHEN 'PPLX' THEN 35
          ELSE 0
        END
      ) +
      (COALESCE(LOG(GREATEST(${alias}."population", 1)), 0) * 5) +
      COALESCE(${alias}."place_rank", 0) +
      (
        GREATEST(
          similarity(public.immutable_unaccent(${col}), public.immutable_unaccent(${qEscaped})),
          similarity(public.immutable_unaccent(COALESCE(${nameLocal},'')), public.immutable_unaccent(${qEscaped})),
          similarity(public.immutable_unaccent(COALESCE(${admin1},'')), public.immutable_unaccent(${qEscaped})),
          similarity(public.immutable_unaccent(COALESCE(${admin2},'')), public.immutable_unaccent(${qEscaped}))
        ) * 40
      ) +
      (
        (CASE WHEN public.immutable_unaccent(COALESCE(${admin1},''))   LIKE '%' || public.immutable_unaccent(${qEscaped}) || '%' THEN 10 ELSE 0 END) +
        (CASE WHEN public.immutable_unaccent(COALESCE(${admin2},''))   LIKE '%' || public.immutable_unaccent(${qEscaped}) || '%' THEN 8  ELSE 0 END) +
        (CASE WHEN public.immutable_unaccent(COALESCE(${country},''))  LIKE '%' || public.immutable_unaccent(${qEscaped}) || '%' THEN 6  ELSE 0 END) +
        (CASE WHEN public.immutable_unaccent(COALESCE(${countryRu},''))LIKE '%' || public.immutable_unaccent(${qEscaped}) || '%' THEN 6  ELSE 0 END)
      )
    ) DESC,
    ${alias}."population" DESC NULLS LAST,
    ${alias}."asciiname_ru" ASC
  `)
}

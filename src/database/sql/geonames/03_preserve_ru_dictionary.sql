-- 03_preserve_ru_dictionary.sql
-- Храним переводы, чтобы не терять их при смене geonameid / удалениях

CREATE TABLE IF NOT EXISTS public.geonames_city_ru_dict (
  country text NOT NULL,
  asciiname text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  asciiname_ru text NOT NULL,
  PRIMARY KEY (country, lower(asciiname), latitude, longitude)
);

CREATE TABLE IF NOT EXISTS public.geonames_admin1_ru_dict (
  country text NOT NULL,
  asciiname text NOT NULL,
  asciiname_ru text NOT NULL,
  PRIMARY KEY (country, lower(asciiname))
);

CREATE TABLE IF NOT EXISTS public.geonames_admin2_ru_dict (
  country text NOT NULL,
  asciiname text NOT NULL,
  admin1_id text,
  asciiname_ru text NOT NULL,
  PRIMARY KEY (country, lower(asciiname), admin1_id)
);

-- Обновляем словари из текущих боевых таблиц (вызывай перед каждым синком)
INSERT INTO public.geonames_city_ru_dict (country, asciiname, latitude, longitude, asciiname_ru)
SELECT country, asciiname, latitude, longitude, asciiname_ru
FROM public.geonames_city
WHERE asciiname_ru IS NOT NULL
ON CONFLICT (country, lower(asciiname), latitude, longitude)
DO UPDATE SET asciiname_ru = EXCLUDED.asciiname_ru;

INSERT INTO public.geonames_admin1_ru_dict (country, asciiname, asciiname_ru)
SELECT country, asciiname, asciiname_ru
FROM public.geonames_admin_1
WHERE asciiname_ru IS NOT NULL
ON CONFLICT (country, lower(asciiname))
DO UPDATE SET asciiname_ru = EXCLUDED.asciiname_ru;

INSERT INTO public.geonames_admin2_ru_dict (country, asciiname, admin1_id, asciiname_ru)
SELECT country, asciiname, admin1_id, asciiname_ru
FROM public.geonames_admin_2
WHERE asciiname_ru IS NOT NULL
ON CONFLICT (country, lower(asciiname), admin1_id)
DO UPDATE SET asciiname_ru = EXCLUDED.asciiname_ru;

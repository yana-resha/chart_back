-- 04_sync_to_prod.sql
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '0';

-- страховочные колонки в city (если вдруг нет)
ALTER TABLE public.geonames_city
  ADD COLUMN IF NOT EXISTS name_local text,
  ADD COLUMN IF NOT EXISTS population bigint,
  ADD COLUMN IF NOT EXISTS dem int,
  ADD COLUMN IF NOT EXISTS feature_code text,
  ADD COLUMN IF NOT EXISTS modification_date date,
  ADD COLUMN IF NOT EXISTS place_rank int;

-- 1) UPSERT: страны
INSERT INTO public.geonames_country (iso, name, name_ru)
SELECT n.iso, n.name, COALESCE(gc.name_ru, NULL)
FROM geonames_new.country_norm n
LEFT JOIN public.geonames_country gc ON gc.iso = n.iso
ON CONFLICT (iso) DO UPDATE SET name = EXCLUDED.name;

-- 2) UPSERT: admin1
INSERT INTO public.geonames_admin_1 (geonameid, asciiname, country)
SELECT n.geonameid, n.asciiname, n.country
FROM geonames_new.admin1_norm n
ON CONFLICT (geonameid) DO UPDATE
  SET asciiname = EXCLUDED.asciiname,
      country   = EXCLUDED.country;

-- 3) UPSERT: admin2
INSERT INTO public.geonames_admin_2 (geonameid, asciiname, country, admin1_id)
SELECT n.geonameid, n.asciiname, n.country, n.admin1_id
FROM geonames_new.admin2_norm n
ON CONFLICT (geonameid) DO UPDATE
  SET asciiname = EXCLUDED.asciiname,
      country   = EXCLUDED.country,
      admin1_id = EXCLUDED.admin1_id;

-- 4) UPSERT: города (с авто-очисткой битых ссылок)
INSERT INTO public.geonames_city
  (geonameid, asciiname, name_local, latitude, longitude, elevation, dem,
   population, country, admin1_id, admin2_id, time_zone, feature_code,
   modification_date, place_rank)
SELECT
  n.geonameid, n.asciiname, n.name_local, n.latitude, n.longitude, n.elevation, n.dem,
  n.population, n.country,
  CASE WHEN a1.geonameid IS NULL THEN NULL ELSE n.admin1_id END AS admin1_id,
  CASE WHEN a1.geonameid IS NULL OR a2.geonameid IS NULL THEN NULL ELSE n.admin2_id END AS admin2_id,
  n.time_zone, n.feature_code, n.modification_date, n.place_rank
FROM geonames_new.city_norm n
LEFT JOIN geonames_new.admin1_norm a1 ON a1.geonameid = n.admin1_id
LEFT JOIN geonames_new.admin2_norm a2 ON a2.geonameid = n.admin2_id
ON CONFLICT (geonameid) DO UPDATE
SET asciiname         = EXCLUDED.asciiname,
    name_local        = EXCLUDED.name_local,
    latitude          = EXCLUDED.latitude,
    longitude         = EXCLUDED.longitude,
    elevation         = EXCLUDED.elevation,
    dem               = EXCLUDED.dem,
    population        = EXCLUDED.population,
    country           = EXCLUDED.country,
    admin1_id         = EXCLUDED.admin1_id,
    admin2_id         = EXCLUDED.admin2_id,
    time_zone         = EXCLUDED.time_zone,
    feature_code      = EXCLUDED.feature_code,
    modification_date = EXCLUDED.modification_date,
    place_rank        = EXCLUDED.place_rank;

-- 5) Перелить переводы из словарей обратно в новые записи (только где NULL)

-- страны
UPDATE public.geonames_country c
SET name_ru = d.asciiname_ru
FROM (
  SELECT DISTINCT ON (iso) iso, NULL::text AS asciiname_ru  -- заглушка, если захочешь вести словарь стран - добавим
) d
WHERE FALSE;  -- сейчас пропускаем; при необходимости сделаем словарь для стран

-- admin1 по country+asciiname
UPDATE public.geonames_admin_1 a
SET asciiname_ru = d.asciiname_ru
FROM public.geonames_admin1_ru_dict d
WHERE a.asciiname_ru IS NULL
  AND d.country = a.country
  AND lower(d.asciiname) = lower(a.asciiname);

-- admin2 по country+asciiname (+admin1_id если есть)
UPDATE public.geonames_admin_2 a
SET asciiname_ru = d.asciiname_ru
FROM public.geonames_admin2_ru_dict d
WHERE a.asciiname_ru IS NULL
  AND d.country = a.country
  AND lower(d.asciiname) = lower(a.asciiname)
  AND (a.admin1_id IS NULL OR d.admin1_id IS NULL OR a.admin1_id = d.admin1_id);

-- города: по country+asciiname+координаты (радиус ~5 км)
UPDATE public.geonames_city c
SET asciiname_ru = d.asciiname_ru
FROM public.geonames_city_ru_dict d
WHERE c.asciiname_ru IS NULL
  AND d.country = c.country
  AND lower(d.asciiname) = lower(c.asciiname)
  AND abs(c.latitude  - d.latitude)  <= 0.05
  AND abs(c.longitude - d.longitude) <= 0.05;

-- 6) DELETE «лишних» (дети -> родители)
DELETE FROM public.geonames_city c
WHERE NOT EXISTS (SELECT 1 FROM geonames_new.city_norm n WHERE n.geonameid = c.geonameid);

DELETE FROM public.geonames_admin_2 a2
WHERE NOT EXISTS (SELECT 1 FROM geonames_new.admin2_norm n WHERE n.geonameid = a2.geonameid);

DELETE FROM public.geonames_admin_1 a1
WHERE NOT EXISTS (SELECT 1 FROM geonames_new.admin1_norm n WHERE n.geonameid = a1.geonameid);

DELETE FROM public.geonames_country co
WHERE NOT EXISTS (SELECT 1 FROM geonames_new.country_norm n WHERE n.iso = co.iso);

-- 7) Проверки целостности (должны быть 0)
DO $$
DECLARE v1 int; v2 int; v3 int; v4 int; v5 int; v6 int;
BEGIN
  SELECT count(*) INTO v1 FROM geonames_city c LEFT JOIN geonames_country co ON co.iso=c.country WHERE c.country IS NOT NULL AND co.iso IS NULL;
  SELECT count(*) INTO v2 FROM geonames_city c LEFT JOIN geonames_admin_1 a1 ON a1.geonameid=c.admin1_id WHERE c.admin1_id IS NOT NULL AND a1.geonameid IS NULL;
  SELECT count(*) INTO v3 FROM geonames_city c LEFT JOIN geonames_admin_2 a2 ON a2.geonameid=c.admin2_id WHERE c.admin2_id IS NOT NULL AND a2.geonameid IS NULL;
  SELECT count(*) INTO v4 FROM geonames_admin_2 a2 LEFT JOIN geonames_admin_1 a1 ON a1.geonameid=a2.admin1_id WHERE a2.admin1_id IS NOT NULL AND a1.geonameid IS NULL;
  SELECT count(*) INTO v5 FROM geonames_admin_1 a1 LEFT JOIN geonames_country co ON co.iso=a1.country WHERE a1.country IS NOT NULL AND co.iso IS NULL;
  SELECT count(*) INTO v6 FROM geonames_admin_2 a2 LEFT JOIN geonames_country co ON co.iso=a2.country WHERE a2.country IS NOT NULL AND co.iso IS NULL;

  RAISE NOTICE 'orphan city->country: %', v1;
  RAISE NOTICE 'orphan city->admin1 : %', v2;
  RAISE NOTICE 'orphan city->admin2 : %', v3;
  RAISE NOTICE 'orphan admin2->admin1: %', v4;
  RAISE NOTICE 'orphan admin1->country: %', v5;
  RAISE NOTICE 'orphan admin2->country: %', v6;
END $$;

-- 8) ANALYZE
ANALYZE public.geonames_country;
ANALYZE public.geonames_admin_1;
ANALYZE public.geonames_admin_2;
ANALYZE public.geonames_city;

COMMIT;

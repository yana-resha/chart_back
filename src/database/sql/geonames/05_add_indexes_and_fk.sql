-- 05_add_indexes_and_fk.sql
-- Добавляет недостающие PK/FK и индексы под поиск/сортировку.

-- ========================
-- 0) Расширения (1 раз)
-- ========================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================
-- 1) Первичные ключи (PK)
-- ========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='geonames_country_pkey') THEN
    ALTER TABLE public.geonames_country
      ADD CONSTRAINT geonames_country_pkey PRIMARY KEY (iso);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='geonames_admin_1_pkey') THEN
    ALTER TABLE public.geonames_admin_1
      ADD CONSTRAINT geonames_admin_1_pkey PRIMARY KEY (geonameid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='geonames_admin_2_pkey') THEN
    ALTER TABLE public.geonames_admin_2
      ADD CONSTRAINT geonames_admin_2_pkey PRIMARY KEY (geonameid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='geonames_city_pkey') THEN
    ALTER TABLE public.geonames_city
      ADD CONSTRAINT geonames_city_pkey PRIMARY KEY (geonameid);
  END IF;
END $$;

-- ==========================================
-- 2) Внешние ключи (мягкие, NOT VALID сначала)
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_city_country') THEN
    ALTER TABLE public.geonames_city
      ADD CONSTRAINT fk_city_country
      FOREIGN KEY (country) REFERENCES public.geonames_country(iso)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_city_admin1') THEN
    ALTER TABLE public.geonames_city
      ADD CONSTRAINT fk_city_admin1
      FOREIGN KEY (admin1_id) REFERENCES public.geonames_admin_1(geonameid)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_city_admin2') THEN
    ALTER TABLE public.geonames_city
      ADD CONSTRAINT fk_city_admin2
      FOREIGN KEY (admin2_id) REFERENCES public.geonames_admin_2(geonameid)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_admin2_admin1') THEN
    ALTER TABLE public.geonames_admin_2
      ADD CONSTRAINT fk_admin2_admin1
      FOREIGN KEY (admin1_id) REFERENCES public.geonames_admin_1(geonameid)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_admin1_country') THEN
    ALTER TABLE public.geonames_admin_1
      ADD CONSTRAINT fk_admin1_country
      FOREIGN KEY (country) REFERENCES public.geonames_country(iso)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_admin2_country') THEN
    ALTER TABLE public.geonames_admin_2
      ADD CONSTRAINT fk_admin2_country
      FOREIGN KEY (country) REFERENCES public.geonames_country(iso)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

-- ===================================================
-- 3) Индексы для поиска (trigram) и частых фильтров
-- ===================================================

-- Города: поиск по русскому/латинскому названию
CREATE INDEX IF NOT EXISTS idx_city_asciiname_ru_trgm
  ON public.geonames_city USING GIN (lower(asciiname_ru) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_city_asciiname_trgm
  ON public.geonames_city USING GIN (lower(asciiname) gin_trgm_ops);

-- Регионы: поиск по названию
CREATE INDEX IF NOT EXISTS idx_admin1_asciiname_trgm
  ON public.geonames_admin_1 USING GIN (lower(asciiname) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_admin2_asciiname_trgm
  ON public.geonames_admin_2 USING GIN (lower(asciiname) gin_trgm_ops);

-- Иерархические фильтры/джойны
CREATE INDEX IF NOT EXISTS idx_city_country_admin
  ON public.geonames_city (country, admin1_id, admin2_id);

CREATE INDEX IF NOT EXISTS idx_admin1_country
  ON public.geonames_admin_1 (country);

CREATE INDEX IF NOT EXISTS idx_admin2_country
  ON public.geonames_admin_2 (country);

CREATE INDEX IF NOT EXISTS idx_admin2_admin1
  ON public.geonames_admin_2 (admin1_id);

-- Сортировка подсказок: приоритет + население
CREATE INDEX IF NOT EXISTS idx_city_place_rank_pop
  ON public.geonames_city (place_rank DESC, population DESC);

-- (опц.) Координаты — если делаешь гео-фильтры по bbox/радиусу
CREATE INDEX IF NOT EXISTS idx_city_coords
  ON public.geonames_city (latitude, longitude);

-- ===========================================
-- 4) (Опционально) Валидация всех новых FK
-- ===========================================
-- Можно закомментировать при первой установке, а валидировать после синка данных.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT quote_ident(n.nspname) ns, quote_ident(c.relname) tbl, quote_ident(co.conname) cn
    FROM pg_constraint co
    JOIN pg_class c ON c.oid = co.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE co.contype='f' AND NOT co.convalidated
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s.%s VALIDATE CONSTRAINT %s;', r.ns, r.tbl, r.cn);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Validation failed for %.%.%: %', r.ns, r.tbl, r.cn, SQLERRM;
    END;
  END LOOP;
END $$;

-- ===========================================
-- 5) ANALYZE — чтобы планировщик знал статистику
-- ===========================================
ANALYZE public.geonames_country;
ANALYZE public.geonames_admin_1;
ANALYZE public.geonames_admin_2;
ANALYZE public.geonames_city;

// 20250921-unaccent-trgm-indexes.ts
import { QueryInterface } from 'sequelize'

export default {
  // ВАЖНО: эта миграция должна выполняться БЕЗ оборачивания в транзакцию,
  // иначе CREATE INDEX CONCURRENTLY упадёт.
  // Если твой раннер игнорирует флаг ниже — запусти эту миграцию отдельно/вручную.
  useTransaction: false as unknown as undefined,

  up: async (queryInterface: QueryInterface) => {
    const run = (sql: string) => queryInterface.sequelize.query(sql)

    // 1) Расширения
    await run(`CREATE EXTENSION IF NOT EXISTS unaccent;`)
    await run(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)

    // 2) IMMUTABLE-обёртка вокруг unaccent
    await run(`
      CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
      RETURNS text
      LANGUAGE sql
      IMMUTABLE
      PARALLEL SAFE
      RETURNS NULL ON NULL INPUT
      AS $$
        SELECT public.unaccent('public.unaccent', $1)
      $$;
    `)

    // 3) Индексы (CONCURRENTLY)
    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_ru_u_trgm;`)
    await run(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS geonames_city_ru_u_trgm
      ON geonames_city
      USING gin ( (public.immutable_unaccent(asciiname_ru)) gin_trgm_ops );
    `)

    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_en_u_trgm;`)
    await run(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS geonames_city_en_u_trgm
      ON geonames_city
      USING gin ( (public.immutable_unaccent(asciiname)) gin_trgm_ops );
    `)

    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_local_u_trgm;`)
    await run(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS geonames_city_local_u_trgm
      ON geonames_city
      USING gin ( (public.immutable_unaccent(COALESCE(name_local, ''))) gin_trgm_ops );
    `)

    // Фильтры
    await run(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS geonames_city_country_idx
      ON geonames_city (country);
    `)

    await run(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS geonames_city_ppl_idx
      ON geonames_city (country)
      WHERE feature_code = 'PPL';
    `)
  },

  down: async (queryInterface: QueryInterface) => {
    const run = (sql: string) => queryInterface.sequelize.query(sql)

    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_ppl_idx;`)
    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_country_idx;`)
    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_local_u_trgm;`)
    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_en_u_trgm;`)
    await run(`DROP INDEX CONCURRENTLY IF EXISTS geonames_city_ru_u_trgm;`)

    // Расширения не трогаем, но функцию можно откатить
    await run(`DROP FUNCTION IF EXISTS public.immutable_unaccent(text);`)
  },
}

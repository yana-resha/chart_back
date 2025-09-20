-- 02_normalize_to_staging.sql

-- страны
DROP TABLE IF EXISTS geonames_new.country_norm;
CREATE TABLE geonames_new.country_norm AS
SELECT NULLIF(iso,'')::text AS iso,
       NULLIF(name,'')::text AS name,
       NULLIF(geonameid,'')::text AS geonameid
FROM geonames_new.country_info_raw
WHERE iso IS NOT NULL AND iso<>'' ;

-- admin1 ("CC.A1")
DROP TABLE IF EXISTS geonames_new.admin1_norm;
CREATE TABLE geonames_new.admin1_norm AS
SELECT code::text AS geonameid,
       COALESCE(NULLIF(asciiname,''), NULLIF(name,''))::text AS asciiname,
       split_part(code,'.',1)::text AS country
FROM geonames_new.admin1_raw;

-- admin2 ("CC.A1.A2")
DROP TABLE IF EXISTS geonames_new.admin2_norm;
CREATE TABLE geonames_new.admin2_norm AS
SELECT code::text AS geonameid,
       COALESCE(NULLIF(asciiname,''), NULLIF(name,''))::text AS asciiname,
       split_part(code,'.',1)::text AS country,
       split_part(code,'.',1)||'.'||split_part(code,'.',2) AS admin1_id
FROM geonames_new.admin2_raw;

-- населённые пункты (живые): P + PPL*, без PPLQ/PPLX
DROP TABLE IF EXISTS geonames_new.city_norm;
CREATE TABLE geonames_new.city_norm AS
SELECT
  NULLIF(geonameid,'')::text                        AS geonameid,
  COALESCE(NULLIF(asciiname,''), NULLIF(name,''))   AS asciiname,
  NULLIF(name,'')                                   AS name_local,
  NULLIF(latitude,'')::double precision             AS latitude,
  NULLIF(longitude,'')::double precision            AS longitude,
  NULLIF(elevation,'')::integer                     AS elevation,
  NULLIF(dem,'')::integer                           AS dem,
  NULLIF(population,'')::bigint                     AS population,
  NULLIF(country_code,'')::text                     AS country,
  CASE WHEN country_code='' OR admin1_code='' THEN NULL
       ELSE country_code||'.'||admin1_code END      AS admin1_id,
  CASE WHEN country_code='' OR admin1_code='' OR admin2_code='' THEN NULL
       ELSE country_code||'.'||admin1_code||'.'||admin2_code END AS admin2_id,
  NULLIF(timezone,'')::text                         AS time_zone,
  NULLIF(feature_code,'')::text                     AS feature_code,
  NULLIF(modification,'')::date                     AS modification_date,
  CASE
    WHEN feature_code='PPLC'  THEN 100
    WHEN feature_code='PPLA'  THEN 90
    WHEN feature_code='PPLA2' THEN 80
    WHEN feature_code='PPLA3' THEN 75
    WHEN feature_code='PPLA4' THEN 70
    WHEN feature_code='PPLG'  THEN 65
    WHEN feature_code='PPLL'  THEN 60
    WHEN feature_code='PPL'   THEN 50
    ELSE 40
  END AS place_rank
FROM geonames_new.all_countries_raw
WHERE feature_class='P'
  AND feature_code LIKE 'PPL%'
  AND feature_code NOT IN ('PPLQ','PPLX');

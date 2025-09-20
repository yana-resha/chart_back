-- 00_create_staging.sql
CREATE SCHEMA IF NOT EXISTS geonames_new;

DROP TABLE IF EXISTS geonames_new.country_info_raw;
CREATE TABLE geonames_new.country_info_raw (
  iso text, iso3 text, iso_numeric text, fips text, name text, capital text,
  area_sq_km text, population text, continent text, tld text,
  currency_code text, currency_name text, phone text,
  postal_format text, postal_regex text, languages text,
  geonameid text, neighbours text, equivalent_fips text
);

DROP TABLE IF EXISTS geonames_new.admin1_raw;
CREATE TABLE geonames_new.admin1_raw (
  code text, name text, asciiname text, geonameid text
);

DROP TABLE IF EXISTS geonames_new.admin2_raw;
CREATE TABLE geonames_new.admin2_raw (
  code text, name text, asciiname text, geonameid text
);

DROP TABLE IF EXISTS geonames_new.all_countries_raw;
CREATE TABLE geonames_new.all_countries_raw (
  geonameid text, name text, asciiname text, alternatenames text,
  latitude text, longitude text, feature_class text, feature_code text,
  country_code text, cc2 text, admin1_code text, admin2_code text,
  admin3_code text, admin4_code text, population text, elevation text,
  dem text, timezone text, modification text
);

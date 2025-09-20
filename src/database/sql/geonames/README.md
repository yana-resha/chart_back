# Как запускать (шпаргалка)

1. Создать staging и RAW:
в pgAdmin → Query Tool → выполнить 00_create_staging.sql.

2. Загрузить файлы:
в терминале:

psql "postgresql://USER:PASSWORD@HOST:5432/DB" -f sql/geonames/01_load_into_raw.psql


3. Построить *_norm:
выполнить 02_normalize_to_staging.sql.

4. Обновить словари переводов:
выполнить 03_preserve_ru_dictionary.sql.

5. Синхронизировать в боевые:
выполнить 04_sync_to_prod.sql.

(Опционально) Удалить staging, когда всё ок:

-- DROP SCHEMA geonames_new CASCADE;

6. Добавить индексы, связи и все прочее для удобного поиска


выполнить 05_add_indexes_and_fk.sql
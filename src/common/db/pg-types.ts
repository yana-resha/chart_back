import * as pg from 'pg'

// int8 / BIGINT -> number
pg.types.setTypeParser(20, (v: string | null) => (v === null ? null : parseInt(v, 10)))

// numeric/decimal -> number
pg.types.setTypeParser(1700, (v: string | null) => (v === null ? null : parseFloat(v)))

// float8 / double precision -> number
pg.types.setTypeParser(701, (v: string | null) => (v === null ? null : parseFloat(v)))

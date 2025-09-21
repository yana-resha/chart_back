import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, WhereOptions, literal } from 'sequelize'
import { GeonamesCity } from './models/geonames-city.model'
import { GeonamesAdmin2 } from './models/geonames-admin-2.model'
import { GeonamesAdmin1 } from './models/geonames-admin-1.model'
import { GeonamesCountry } from './models/geonames-country.model'
import { buildSmartOrder } from './utils/sort-utils'
import { expandQueryVariants, normalizeQuery } from './utils/text-normalize'
import { uniqByGeonameId } from './utils/uniq'
import { collapseSeatsPreferPPL } from './utils/collapse-seats'
import { LocalMemoryCacheService } from 'src/common/cache/local-memory-cache.service'
import { buildLocalityCacheKey } from './utils/cache-key'
import { FindCitiesSmartOpts } from './types'
import { hasPeekValid } from 'src/common/cache/cache.guards'

@Injectable()
export class LocalityService {
  private readonly logger = new Logger(LocalityService.name)
  constructor(
    @InjectModel(GeonamesCity) private readonly cityModel: typeof GeonamesCity,
    private readonly memoryCache: LocalMemoryCacheService,
  ) {}

  private pickTtlSeconds(q: string) {
    const len = (q ?? '').trim().length
    if (len === 0) return 0 // пустое не кэшируем
    if (len <= 2) return 60 // очень короткие — 1 мин
    if (len <= 4) return 180
    return 600 // 10 минут
  }

  async findCitiesSmart(query: string, opts: FindCitiesSmartOpts = {}) {
    const ttl = this.pickTtlSeconds(query)
    if (ttl <= 0) {
      const t0 = Date.now()
      const val = await this._findCitiesSmartDb(query, opts)
      this.logger.debug(`[NO-CACHE] q="${query}" rows=${val.length} ms=${Date.now() - t0}`)
      return val
    }

    const key = buildLocalityCacheKey(query, opts)

    // заранее посмотрим, есть ли валидная запись
    const hitBefore = hasPeekValid(this.memoryCache) ? this.memoryCache.peekValid(key) !== false : false

    const t0 = Date.now()
    // 👉 типобезопасно: без any и без fallback'ов — сервис кэша это умеет
    const { value: rows, meta } = await this.memoryCache.getOrCreateWithMeta(key, ttl, () =>
      this._findCitiesSmartDb(query, opts),
    )

    const left = meta.leftSec != null ? ` left=${Math.round(meta.leftSec)}s` : ''
    // Покажем, что было известно ДО вызова (hitBefore), и что получилось по факту (meta.source)
    this.logger.debug(
      `[CACHE ${hitBefore ? 'HIT' : 'MISS'} => ${meta.source}] key=${meta.key} rows=${rows.length} ttl=${meta.ttlSec}s${left} ms=${Date.now() - t0}`,
    )

    return rows
  }

  private async _findCitiesSmartDb(query: string, opts: FindCitiesSmartOpts = {}) {
    const lang = opts.lang ?? 'ru'
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
    const offset = Math.max(opts.offset ?? 0, 0)

    const q = normalizeQuery(query)
    const allVars = expandQueryVariants(q)
    // ограничим количество вариантов, чтобы не раздувать OR (обычно 2 хватает: кир/лат)
    const variants = [...new Set(allVars)].slice(0, 3)

    const baseAlias = '"GeonamesCity"'
    const colSQL = lang === 'ru' ? `${baseAlias}."asciiname_ru"` : `${baseAlias}."asciiname"`
    const nameLocalSQL = `${baseAlias}."name_local"`

    // WHERE с точным совпадением выражений индекса (важно для name_local — через COALESCE)
    const orBlocks = variants.flatMap((v) => {
      const pattern = `%${v}%`
      return [
        this.cityModel.sequelize!.where(literal(`public.immutable_unaccent(${colSQL})`), {
          [Op.iLike]: pattern,
        }),
        this.cityModel.sequelize!.where(literal(`public.immutable_unaccent(COALESCE(${nameLocalSQL},''))`), {
          [Op.iLike]: pattern,
        }),
      ]
    })

    const where: WhereOptions = {
      [Op.and]: [
        { [Op.or]: orBlocks },
        ...(opts.countryIso ? [{ country: opts.countryIso.toUpperCase() }] : []),
        // НЕ фильтруем по feature_code = 'PPL' — иначе пропадают однотипные PPLA* без дубля PPL
      ],
    }

    const qEsc = this.cityModel.sequelize!.escape(q)
    const order = buildSmartOrder({ qEscaped: qEsc, lang, alias: baseAlias })

    // поменьше oversampling: хватит небольшого запаса сверх страницы
    const rowsNeeded = offset + limit
    const fetchLimit = Math.min(rowsNeeded + 50, 500)

    const rows = await this.cityModel.findAll({
      where,
      include: [
        { model: GeonamesAdmin2, as: 'admin2_data', required: false },
        { model: GeonamesAdmin1, as: 'admin1_data', required: false },
        { model: GeonamesCountry, as: 'country_data', required: false },
      ],
      order,
      limit: fetchLimit,
      offset: 0,
      subQuery: false,
      attributes: {
        include: [
          [literal(`public.immutable_unaccent(${colSQL})`), 'name_norm'],
          [
            literal(`
            GREATEST(
              similarity(public.immutable_unaccent(${colSQL}), public.immutable_unaccent(${qEsc})),
              similarity(public.immutable_unaccent(COALESCE(${nameLocalSQL},'')), public.immutable_unaccent(${qEsc}))
            )
          `),
            'sim',
          ],
        ],
      },
    })

    const collapsed = collapseSeatsPreferPPL(rows) // схлопывает «адм. центр vs населённый пункт» в пользу PPL
    const deduped = uniqByGeonameId(collapsed)
    return deduped.slice(offset, offset + limit)
  }
}

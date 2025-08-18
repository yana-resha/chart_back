import { AppException } from 'src/common/errors/app.exception'
import {
  SE_GREG_CAL,
  SE_JUL_CAL,
  SEFLG_SPEED,
  SEFLG_SWIEPH,
  swe_calc_ut,
  swe_houses,
  swe_julday,
  swe_set_ephe_path,
} from 'swisseph'
import { existsSync } from 'fs'
import {
  PlanetPosition,
  Planets,
  FICTITIOUS_PLANETS,
  Houses,
  AstroCalculationResult,
  IHousesActivity,
  HouseActivityVariables,
  SwephHouseSystem,
  SwephCode,
} from '../types/sweph.types'
import { House_System } from 'src/common/astro/enums/houses.enum'

export class SwephHelper {
  static initialized = false

  static init(ephePath: string) {
    if (!this.initialized) {
      if (existsSync(ephePath)) {
        swe_set_ephe_path(ephePath)
        this.initialized = true
      } else {
        throw new AppException('EPHE_PATH_NOT_EXIST', `Укажите корректный путь до файлов с эфемеридами!`)
      }
    }
  }

  private static checkInitialized() {
    if (!this.initialized) {
      throw new AppException(
        'EPHE_PATH_NOT_SET',
        'Эфемериды не инициализированы. Перед расчетами вызовите SwephHelper.init(path)',
      )
    }
  }

  private static normalizeLongitude(value: number): number {
    const normalized = ((value % 360) + 360) % 360
    return parseFloat(normalized.toFixed(6))
  }

  static toUniversalTime(date: string | Date, timezoneHours: number): Date {
    // timezoneHours: локальный часовой сдвиг относительно UTC (например, +3, -4, 5.5, -9.75)
    const local = new Date(date)
    const totalMinutes = Math.round(timezoneHours * 60)
    // локальное = UTC + offset  →  UTC = локальное - offset
    const utcMs = local.getTime() - totalMinutes * 60_000
    return new Date(utcMs)
  }

  private static getCalendarFlag(year: number, month: number, day: number): 0 | 1 {
    const isBeforeGregorianReform =
      year < 1582 || (year === 1582 && (month < 10 || (month === 10 && day < 15)))
    return isBeforeGregorianReform ? SE_JUL_CAL : SE_GREG_CAL
  }

  static toJulianDay(utcDate: Date): number {
    const year = utcDate.getUTCFullYear()
    const month = utcDate.getUTCMonth() + 1
    const day = utcDate.getUTCDate()

    const hour = utcDate.getUTCHours()
    const minute = utcDate.getUTCMinutes()
    const second = utcDate.getUTCSeconds()
    const millisecond = utcDate.getUTCMilliseconds()

    const fractionalDay = hour + minute / 60 + second / 3600 + millisecond / 3600000
    const calendarFlag = this.getCalendarFlag(year, month, day)

    return swe_julday(year, month, day, fractionalDay, calendarFlag)
  }

  static async calculatePlanets(
    jd: number,
    utcDate: Date,
    latitude: number,
    longitude: number,
    hsysCode: SwephCode, // ⬅️ добавили код системы домов
  ): Promise<PlanetPosition[]> {
    this.checkInitialized()
    const results: PlanetPosition[] = []
    let sunLongitude = 0
    let moonLongitude = 0
    let rahuLongitude = 0
    let rahuLatitude = 0
    let rahuDistance = 0
    let rahuSpeed = 0

    for (const [name, planetId] of Object.entries(Planets)) {
      if (FICTITIOUS_PLANETS.includes(name)) continue

      const pos = await this.calculatePlanet(jd, Number(planetId))
      const planetData: PlanetPosition = {
        name,
        longitude: pos.longitude,
        latitude: pos.latitude,
        distance: pos.distance,
        speed: pos.speed,
        isRetrograde: pos.speed < 0,
      }
      results.push(planetData)

      if (name === 'Sun') sunLongitude = pos.longitude
      if (name === 'Moon') moonLongitude = pos.longitude
      if (name === 'Rahu') {
        rahuLongitude = pos.longitude
        rahuLatitude = pos.latitude
        rahuDistance = pos.distance
        rahuSpeed = pos.speed

        results.push({
          name: 'Ketu',
          longitude: this.normalizeLongitude(rahuLongitude + 180),
          latitude: -rahuLatitude,
          distance: rahuDistance,
          speed: -rahuSpeed,
          isRetrograde: rahuSpeed < 0,
        })
      }
    }

    // Fortuna должна использовать тот же ASC, что и выбранная система домов:
    const fortuna = await this.calculateFortuna(
      jd,
      sunLongitude,
      moonLongitude,
      latitude,
      longitude,
      hsysCode, // ⬅️ пробрасываем код
    )
    results.push(fortuna)

    // Selena по Шестопалову — без привязки к домам
    const selenaLongitude = this.calculateSelenaByShestopalov(utcDate)
    results.push({
      name: 'Selena',
      longitude: this.normalizeLongitude(selenaLongitude),
      latitude: 0,
      distance: 1,
      speed: 0,
      isRetrograde: false,
    })

    /* Временно меняем порядок Раху/Кету */
    const rahuIndex = results.findIndex((p) => p.name === 'Rahu')
    const ketuIndex = results.findIndex((p) => p.name === 'Ketu')
    if (rahuIndex > -1 && ketuIndex > -1 && ketuIndex > rahuIndex) {
      const [ketu] = results.splice(ketuIndex, 1)
      results.splice(rahuIndex, 0, ketu)
    }

    return results
  }

  private static calculateSelenaByShestopalov(date: Date): number {
    const year = date.getUTCFullYear() % 100
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()

    let selena = 134.7 + 51.429 * year + 4.286 * month + 0.141 * day
    selena = selena % 360
    if (selena < 0) selena += 360

    return selena
  }

  private static async calculateFortuna(
    jd: number,
    sunLongitude: number,
    moonLongitude: number,
    latitude: number,
    longitude: number,
    hsysCode: SwephCode, // ⬅️ добавили код системы домов
  ): Promise<PlanetPosition> {
    const houses = await this.calculateHouses(jd, latitude, longitude, hsysCode)
    const ascendant = houses.ascendant

    const sunHouse = this.getHouseIndex(sunLongitude, houses.houses)
    const isDayChart = sunHouse >= 7 && sunHouse <= 12

    const fortunaLongitude = isDayChart
      ? (ascendant + moonLongitude - sunLongitude + 360) % 360
      : (ascendant + sunLongitude - moonLongitude + 360) % 360

    return {
      name: 'Fortuna',
      longitude: this.normalizeLongitude(fortunaLongitude),
      latitude: 0,
      distance: 1,
      speed: 0,
      isRetrograde: false,
    }
  }

  private static getHouseIndex(point: number, houseCusps: number[]): number {
    for (let i = 0; i < 12; i++) {
      const cuspStart = houseCusps[i]
      const cuspEnd = houseCusps[(i + 1) % 12]

      if (cuspStart < cuspEnd) {
        if (point >= cuspStart && point < cuspEnd) return i + 1
      } else {
        if (point >= cuspStart || point < cuspEnd) return i + 1
      }
    }
    return 1
  }

  static calculatePlanet(
    julianDay: number,
    planetId: number,
  ): Promise<{ longitude: number; latitude: number; distance: number; speed: number }> {
    this.checkInitialized()
    return new Promise((resolve, reject) => {
      swe_calc_ut(julianDay, planetId, SEFLG_SWIEPH | SEFLG_SPEED, (result) => {
        if ('error' in result || !('latitude' in result)) {
          reject(
            new AppException(
              'PLANET_CALCULATION_ERROR',
              `Не удалось вычислить положение планеты: ${planetId})}`,
            ),
          )
        } else {
          const { longitude, latitude, distance, longitudeSpeed } = result
          resolve({
            longitude: this.normalizeLongitude(longitude),
            latitude,
            distance,
            speed: longitudeSpeed,
          })
        }
      })
    })
  }

  static calculateHouses(
    jd: number,
    latitude: number,
    longitude: number,
    hsys: SwephCode, // ⬅️ метод принимает уже готовый код
  ): Promise<Houses> {
    this.checkInitialized()
    return new Promise((resolve, reject) => {
      swe_houses(jd, latitude, longitude, hsys, (result) => {
        if ('error' in result || !('house' in result)) {
          reject(
            new AppException(
              'HOUSES_CALCULATION_ERROR',
              'Ошибка в вычислении домов гороскопа: ' + result.error,
            ),
          )
        } else {
          resolve({
            ascendant: this.normalizeLongitude(result.ascendant),
            midheaven: this.normalizeLongitude(result.mc),
            houses: result.house.map((h) => this.normalizeLongitude(h)),
          })
        }
      })
    })
  }

  static calculateHousesActivity(planets: PlanetPosition[], houses: number[]): IHousesActivity {
    const houseActivity: IHousesActivity = {}
    for (let i = 1; i <= 12; i++) {
      houseActivity[i] = HouseActivityVariables.EMPTY
    }

    for (const planet of planets) {
      const houseIndex = this.getHouseIndex(planet.longitude, houses)
      houseActivity[houseIndex] = HouseActivityVariables.ACTIVE
    }

    return houseActivity
  }

  static async calculateNatalChart(
    date: string,
    timezone: number,
    latitude: number,
    longitude: number,
    hsys: House_System = House_System.Placidus, // ⬅️ фронт может не передать — используем Плацидус
  ): Promise<AstroCalculationResult> {
    this.checkInitialized()
    const utcDate = this.toUniversalTime(date, timezone)
    const jd = this.toJulianDay(utcDate)

    const effectiveHsys: House_System = hsys ?? House_System.Placidus
    const effectiveCode: SwephCode = SwephHouseSystem[effectiveHsys]

    const [planets, houses] = await Promise.all([
      this.calculatePlanets(jd, utcDate, latitude, longitude, effectiveCode), // ⬅️ пробрасываем код
      this.calculateHouses(jd, latitude, longitude, effectiveCode),
    ])

    const housesActivity = this.calculateHousesActivity(planets, houses.houses)

    return {
      sourceData: {
        datetime: utcDate.toISOString(),
        timezone,
        latitude,
        longitude,
        hsys: effectiveHsys, // что реально использовано (без кодов SE наружу)
        jd,
      },
      result: {
        planets,
        houses,
        housesActivity,
      },
    }
  }
}

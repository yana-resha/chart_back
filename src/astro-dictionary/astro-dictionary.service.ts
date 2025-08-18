import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { AstroChartType } from 'src/common/astro/enums/chart-type.enum'
import { AstroConfigurationType } from '../astro-chart/types/configuration.types'
import { PlanetName, DictionaryKey, AstroDictionaryCategory } from './dictionary.types'
import { AspectType } from 'src/common/astro/enums/aspects.enum'
import { ZodiacSign } from 'src/common/astro/enums/zodiacs.enum'

@Injectable()
export class AstroDictionaryService {
  private readonly basePath: string

  constructor() {
    this.basePath =
      process.env.NODE_ENV === 'development'
        ? join(process.cwd(), 'src', 'astro-dictionary', 'data')
        : join(__dirname, 'data')
  }
  /**
   * Возвращает интерпретацию для дома в знаке зодиака
   */
  getHouseInSign(chart: AstroChartType, house: number, sign: ZodiacSign): string | null {
    try {
      const path = join(this.basePath, chart, 'houses-in-signs.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<number, Record<ZodiacSign, string>> = JSON.parse(raw)
      return data[house]?.[sign] ?? null
    } catch {
      return null
    }
  }

  /**
   * Возвращает интерпретации для набора домов в знаках зодиака
   */
  getManyHouseInSign(
    chart: AstroChartType,
    items: { house: number; sign: ZodiacSign }[],
  ): { house: number; sign: ZodiacSign; text: string | null }[] {
    try {
      const path = join(this.basePath, chart, 'houses-in-signs.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<number, Record<ZodiacSign, string>> = JSON.parse(raw)

      return items.map(({ house, sign }) => ({
        house,
        sign,
        text: data[house]?.[sign] ?? null,
      }))
    } catch {
      return items.map(({ house, sign }) => ({ house, sign, text: null }))
    }
  }

  /**
   * Возвращает интерпретацию планеты в знаке зодиака
   */
  getPlanetInSign(chart: AstroChartType, planet: PlanetName, sign: ZodiacSign): string | null {
    try {
      const path = join(this.basePath, chart, 'planets-in-signs.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<PlanetName, Record<ZodiacSign, string>> = JSON.parse(raw)
      return data[planet]?.[sign] ?? null
    } catch {
      return null
    }
  }

  /**
   * Возвращает интерпретацию аспекта между двумя планетами
   */
  getAspect(
    chart: AstroChartType,
    planetA: PlanetName,
    planetB: PlanetName,
    aspect: AspectType,
  ): string | null {
    try {
      const path = join(this.basePath, chart, 'aspects.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<AspectType, Record<PlanetName, Record<PlanetName, string>>> = JSON.parse(raw)
      return data[aspect]?.[planetA]?.[planetB] ?? data[aspect]?.[planetB]?.[planetA] ?? null
    } catch {
      return null
    }
  }

  /**
   * Возвращает интерпретацию планеты в доме гороскопа
   */
  getPlanetInHouse(chart: AstroChartType, planet: PlanetName, house: number): string | null {
    try {
      const path = join(this.basePath, chart, 'planets-in-houses.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<PlanetName, Record<number, string>> = JSON.parse(raw)
      return data[planet]?.[house] ?? null
    } catch {
      return null
    }
  }

  /**
   * Возвращает интерпретацию конфигурации с указанными планетами
   */
  getConfiguration(
    chart: AstroChartType,
    config: AstroConfigurationType,
    planets: PlanetName[],
  ): string | null {
    try {
      const path = join(this.basePath, chart, 'configurations.json')
      const raw = readFileSync(path, 'utf8')
      const data: Array<{ config: AstroConfigurationType; planets: PlanetName[]; text: string }> =
        JSON.parse(raw)

      const sortedInput = [...planets].sort()

      const match = data.find(
        (entry) =>
          entry.config === config &&
          entry.planets.length === sortedInput.length &&
          [...entry.planets].sort().every((p, i) => p === sortedInput[i]),
      )

      return match?.text ?? null
    } catch {
      return null
    }
  }

  /**
   * Возвращает интерпретации для набора планет в знаках зодиака
   */
  getManyPlanetInSign(
    chart: AstroChartType,
    items: { planet: PlanetName; sign: ZodiacSign }[],
  ): { planet: PlanetName; sign: ZodiacSign; text: string | null }[] {
    try {
      const path = join(this.basePath, chart, 'planets-in-signs.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<PlanetName, Record<ZodiacSign, string>> = JSON.parse(raw)
      return items.map(({ planet, sign }) => ({
        planet,
        sign,
        text: data[planet]?.[sign] ?? null,
      }))
    } catch {
      return items.map(({ planet, sign }) => ({ planet, sign, text: null }))
    }
  }

  /**
   * Возвращает интерпретации для набора аспектов между планетами
   */
  getManyAspect(
    chart: AstroChartType,
    items: { planetA: PlanetName; planetB: PlanetName; aspect: AspectType }[],
  ): { planetA: PlanetName; planetB: PlanetName; aspect: AspectType; text: string | null }[] {
    try {
      const path = join(this.basePath, chart, 'aspects.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<AspectType, Record<PlanetName, Record<PlanetName, string>>> = JSON.parse(raw)

      return items.map(({ planetA, planetB, aspect }) => ({
        planetA,
        planetB,
        aspect,
        text: data[aspect]?.[planetA]?.[planetB] ?? data[aspect]?.[planetB]?.[planetA] ?? null,
      }))
    } catch {
      return items.map(({ planetA, planetB, aspect }) => ({ planetA, planetB, aspect, text: null }))
    }
  }

  /**
   * Возвращает интерпретации для набора планет в домах
   */
  getManyPlanetInHouse(
    chart: AstroChartType,
    items: { planet: PlanetName; house: number }[],
  ): { planet: PlanetName; house: number; text: string | null }[] {
    try {
      const path = join(this.basePath, chart, 'planets-in-houses.json')
      const raw = readFileSync(path, 'utf8')
      const data: Record<PlanetName, Record<number, string>> = JSON.parse(raw)

      return items.map(({ planet, house }) => ({
        planet,
        house,
        text: data[planet]?.[house] ?? null,
      }))
    } catch {
      return items.map(({ planet, house }) => ({ planet, house, text: null }))
    }
  }

  /**
   * Возвращает интерпретации для набора конфигураций планет
   */
  getManyConfiguration(
    chart: AstroChartType,
    items: { config: AstroConfigurationType; planets: PlanetName[] }[],
  ): { config: AstroConfigurationType; planets: PlanetName[]; text: string | null }[] {
    try {
      const path = join(this.basePath, chart, 'configurations.json')
      const raw = readFileSync(path, 'utf8')
      const data: Array<{ config: AstroConfigurationType; planets: PlanetName[]; text: string }> =
        JSON.parse(raw)

      return items.map(({ config, planets }) => {
        const sortedInput = [...planets].sort()
        const match = data.find(
          (entry) =>
            entry.config === config &&
            entry.planets.length === sortedInput.length &&
            [...entry.planets].sort().every((p, i) => p === sortedInput[i]),
        )
        return {
          config,
          planets,
          text: match?.text ?? null,
        }
      })
    } catch {
      return items.map(({ config, planets }) => ({ config, planets, text: null }))
    }
  }

  /**
   * Универсальный метод для получения интерпретации по ключу словаря
   */
  getEntry(key: DictionaryKey): string | null {
    switch (key.category) {
      case AstroDictionaryCategory.PLANET_IN_SIGN:
        return this.getPlanetInSign(key.chart, key.planet, key.sign)
      case AstroDictionaryCategory.ASPECT:
        return this.getAspect(key.chart, key.planetA, key.planetB, key.aspect)
      case AstroDictionaryCategory.PLANET_IN_HOUSE:
        return this.getPlanetInHouse(key.chart, key.planet, key.house)
      case AstroDictionaryCategory.CONFIGURATION:
        return this.getConfiguration(key.chart, key.config, key.planets)
      case AstroDictionaryCategory.HOUSE_IN_SIGN:
        return this.getHouseInSign(key.chart, key.house, key.sign)
      default:
        return null
    }
  }
}

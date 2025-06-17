import { Injectable } from '@nestjs/common'
import { AspectCalculator } from './helpers/aspect-calculator.helper'
import { SwephHelper } from './helpers/sweph.helper'
import { Aspect, ChartAspectStatistics, StrongestPlanet } from './types/aspect.types'
import { AstroCalculationSourceData, AstroCalculationValue } from './types/sweph.types'
import { AspectConfigurationDetector } from './helpers/aspect-configuration.helper'
import { AstroConfiguration } from './types/configuration.types'

export interface CalculateFullNatalChartResult {
  sourceData: AstroCalculationSourceData
  result: AstroCalculationValue & { aspects: Aspect[] } & { configurations: AstroConfiguration[] } & {
    strongestPlanet: StrongestPlanet
  } & {
    chartAspectStatistics: ChartAspectStatistics
  }
}

@Injectable()
export class AstroService {
  constructor() {
    void this.calculateFullNatalChart('1995-01-11T18:55:00Z', 5, 52.7667, 55.7833)
  }
  /**
   * Полный расчет натальной карты:
   * - планеты
   * - дома
   * - аспекты
   */

  async calculateFullNatalChart(
    date: string,
    timezone: number,
    latitude: number,
    longitude: number,
  ): Promise<CalculateFullNatalChartResult> {
    // 1. Сначала расчёт положения планет и домов
    const baseChart = await SwephHelper.calculateNatalChart(date, timezone, latitude, longitude)
    // 2. Расчет аспектов
    const aspects = AspectCalculator.calculateAspects(baseChart.result.planets)
    // 3. Расчет самой сильной планеты по аспектам (планета, которая суммарно учавствует в самых сильных аспектах)
    const strongestPlanet = AspectCalculator.getStrongestPlanet(aspects)
    // 4. Расчет конфигураций на основе аспектов
    const configurations = AspectConfigurationDetector.detectConfigurations(aspects)

    // 5. Расчет силы карты по аспектам
    const chartAspectStatistics = AspectCalculator.calculateChartAspectStatistics(aspects)
    // 6. Возвращаем результат
    return {
      sourceData: baseChart.sourceData,
      result: {
        ...baseChart.result,
        aspects,
        configurations,
        strongestPlanet,
        chartAspectStatistics,
      },
    }
  }
}

export enum AstroChartType {
  NATAL = 'natal',
  HORARY = 'horary',
  SYNASTRY = 'synastry',
}

export const AstroChartTypeNames: Record<AstroChartType, string> = {
  [AstroChartType.NATAL]: 'Натальная',
  [AstroChartType.HORARY]: 'Хорарная',
  [AstroChartType.SYNASTRY]: 'Синастрическая',
}

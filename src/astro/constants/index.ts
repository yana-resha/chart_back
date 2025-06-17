import { AspectType } from '../types/aspect.types'
import { Planet_Variables } from '../types/common.types'

export const ASPECT_DESCRIPTION: Record<AspectType, string> = {
  [AspectType.Conjunction]: 'Соединение',
  [AspectType.Opposition]: 'Оппозиция',
  [AspectType.Trine]: 'Тригон',
  [AspectType.Square]: 'Квадрат',
  [AspectType.Sextile]: 'Cекстиль',
  [AspectType.Quincunx]: 'Квинконс',
}

export const PLANET_DESCRIPTION: Record<Planet_Variables, string> = {
  [Planet_Variables.Sun]: 'Солнце',
  [Planet_Variables.Moon]: 'Луна',
  [Planet_Variables.Mercury]: 'Меркурий',
  [Planet_Variables.Venus]: 'Венера',
  [Planet_Variables.Mars]: 'Марс',
  [Planet_Variables.Jupiter]: 'Юпитер',
  [Planet_Variables.Saturn]: 'Сатурн',
  [Planet_Variables.Uranus]: 'Уран',
  [Planet_Variables.Neptune]: 'Нептун',
  [Planet_Variables.Pluto]: 'Плутон',
  [Planet_Variables.Proserpina]: 'Прозерпина',
  [Planet_Variables.Chiron]: 'Хирон',
  [Planet_Variables.Lilith]: 'Лилит',
  [Planet_Variables.Rahu]: 'Раху',
  [Planet_Variables.Ketu]: 'Кету',
  [Planet_Variables.Fortuna]: 'Парс Фортуны',
  [Planet_Variables.Selena]: 'Селена',
}

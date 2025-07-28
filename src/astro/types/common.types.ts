export enum ZodiacSign {
  Aries = 'Aries',
  Taurus = 'Taurus',
  Gemini = 'Gemini',
  Cancer = 'Cancer',
  Leo = 'Leo',
  Virgo = 'Virgo',
  Libra = 'Libra',
  Scorpio = 'Scorpio',
  Sagittarius = 'Sagittarius',
  Capricorn = 'Capricorn',
  Aquarius = 'Aquarius',
  Pisces = 'Pisces',
}

export const ZODIAC_SIGNS = Object.values(ZodiacSign)

export enum Planet_Variables {
  Sun = 'Sun',
  Moon = 'Moon',
  Mercury = 'Mercury',
  Venus = 'Venus',
  Mars = 'Mars',
  Jupiter = 'Jupiter',
  Saturn = 'Saturn',
  Uranus = 'Uranus',
  Neptune = 'Neptune',
  Pluto = 'Pluto',

  Proserpina = 'Proserpina',
  Chiron = 'Chiron',
  Lilith = 'Lilith',
  Ketu = 'Ketu', // Южный узел будет вычисляться как Rahu + 180°
  Rahu = 'Rahu',
  Fortuna = 'Fortuna',
  Selena = 'Selena',
}

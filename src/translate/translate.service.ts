import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GeonamesCountry } from 'src/locality/models/geonames-country.model'
import { Op } from 'sequelize'
import { AppException } from 'src/common/errors/app.exception'
import { GeonamesAdmin1 } from 'src/locality/models/geonames-admin-1.model'
import { GeonamesAdmin2 } from 'src/locality/models/geonames-admin-2.model'
import { GeonamesCity } from 'src/locality/models/geonames-city.model'

const ADMIN_2_GLOSSARY = [
  // ✅ Термины административных единиц
  { sourceText: 'Bashkia', translatedText: 'Башкиа' },
  { sourceText: 'Partido de', translatedText: 'Муниципалитет' },
  { sourceText: 'Municipality', translatedText: 'Муниципалитет' },
  { sourceText: 'Commune', translatedText: 'Коммуна' },
  { sourceText: 'Province', translatedText: 'Провинция' },
  { sourceText: 'Prefecture', translatedText: 'Префектура' },
  { sourceText: 'County', translatedText: 'Графство' },
  { sourceText: 'Canton', translatedText: 'Кантон' },
  { sourceText: 'Oblast', translatedText: 'Область' },
  { sourceText: 'State', translatedText: 'Штат' },
  { sourceText: 'Wilaya', translatedText: 'Вилайет' },
  { sourceText: 'Kecamatan', translatedText: 'Кекаматан' },
  { sourceText: 'Kabupaten', translatedText: 'Кабупатен' },
  { sourceText: 'Arrondissement', translatedText: 'Округ' },
  { sourceText: 'Voivodeship', translatedText: 'Воеводство' },
  { sourceText: 'Raion', translatedText: 'Район' },
  { sourceText: 'Nawahi', translatedText: 'Навахи' },
  { sourceText: 'Mouhafazat', translatedText: 'Мухафаза' },
  { sourceText: 'Distrito Municipal', translatedText: 'Муниципальный округ' },
  { sourceText: 'Comuna', translatedText: 'Коммуна' },
  { sourceText: 'Politischer Bezirk', translatedText: 'Политический округ' },
  { sourceText: 'Municipio de', translatedText: 'Муниципалитет' },
  { sourceText: 'Borough of', translatedText: 'Боро' },
  { sourceText: 'pagasts', translatedText: 'Волость' },
  { sourceText: 'Barrio', translatedText: 'Квартал' },
  { sourceText: 'Barrio-Pueblo', translatedText: 'Центральный квартал' },
  { sourceText: 'Kommun', translatedText: 'Коммуна' }, // Швеция
  // 📍 Собственные топонимы
  { sourceText: 'Blacktown', translatedText: 'Блэктон' },
  { sourceText: 'Shellharbour', translatedText: 'Шеллхарбор' },
  { sourceText: 'Snowy Monaro Regional', translatedText: 'Регион Сноуи-Монаро' },
  { sourceText: 'Cairns', translatedText: 'Кэрнс' },
  { sourceText: 'Robe', translatedText: 'Роуб' },
  { sourceText: 'Tea Tree Gully', translatedText: 'Ти-Три-Галли' },
  { sourceText: 'Meander Valley', translatedText: 'Долина Миандер' },
  { sourceText: 'Cocos', translatedText: 'Кокосовые острова' },
  { sourceText: 'Itarantim', translatedText: 'Итарантим' },
  { sourceText: 'Silverwood', translatedText: 'Сильвервуд' },
  { sourceText: 'Wee Too Beach', translatedText: 'Пляж Уи-Ту' },
  { sourceText: 'Bigwoods', translatedText: 'Бигвудс' },
  { sourceText: 'Rose Hall', translatedText: 'Роуз Холл' },
  { sourceText: 'Red Bank', translatedText: 'Ред-Бэнк' },
  { sourceText: 'Pepper', translatedText: 'Пеппер' },
  { sourceText: 'Warminster', translatedText: 'Уорминстер' },
]

const SYSTEM_PROMPT = `
Ты — транскриптор. Твоя задача — транскрибировать английские названия населённых пунктов на русский язык. Не переводи значение слова, а передавай его звучание, как оно произносится.

🔹 Примеры:
White → Уайт
Lake City → Лейк-Сити
Mount Vernon → Маунт-Вернон
Fort Worth → Форт-Уэрт
Saint George → Сейнт-Джордж

Важно:
- Пиши только транскрибированное название, без лишнего текста.
- Используй дефисы для разделения слов, если название состоит из нескольких (например, Сан-Франциско).
- Работай с названиями так, как их произносит носитель английского языка.
- Никогда не пиши перевод значения. Даже если слово известно в русском языке — пиши только по звучанию.
`.trim()

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name)
  constructor(
    @InjectModel(GeonamesCountry) private readonly countryModel: typeof GeonamesCountry,
    @InjectModel(GeonamesAdmin1) private readonly geonamesAdmin1: typeof GeonamesAdmin1,
    @InjectModel(GeonamesAdmin2) private readonly geonamesAdmin2: typeof GeonamesAdmin2,
    @InjectModel(GeonamesCity) private readonly geonamesCity: typeof GeonamesCity,
  ) {
    this.transcribeCitiesWithLlm()
  }

  /**
   * Метод, который ищет города с уникальным `asciiname`, у которых заполнено `asciiname_ru`,
   * и копирует `asciiname_ru` в другие строки с таким же `asciiname`, где `asciiname_ru` пуст.
   */
  async fillMissingRussianNamesByAsciiName(): Promise<void> {
    const citiesWithRu = await this.geonamesCity.findAll({
      where: {
        asciiname_ru: {
          [Op.ne]: null,
        },
      } as any,
      attributes: ['asciiname', 'asciiname_ru'],
      group: ['asciiname', 'asciiname_ru'],
    })

    let totalUpdated = 0

    for (const city of citiesWithRu) {
      const { asciiname, asciiname_ru } = city

      const [updatedCount] = await this.geonamesCity.update(
        { asciiname_ru },
        {
          where: {
            asciiname,
            asciiname_ru: {
              [Op.or]: [null, ''],
            },
          } as any,
        },
      )

      if (updatedCount > 0) {
        totalUpdated += updatedCount
        this.logger.log(`✅ Обновлено ${updatedCount} строк для города "${asciiname}" → "${asciiname_ru}"`)
      }
    }

    this.logger.log(`🎉 Всего обновлено: ${totalUpdated} строк.`)
  }

  private async fetchLlmTranscription(cityName: string): Promise<string | null> {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistralai/mistral-nemo-instruct-2407',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Название: ${cityName}` },
        ],
        temperature: 0.4,
        max_tokens: 50,
      }),
    })

    const data = await response.json()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data?.choices?.[0]?.message?.content?.trim() || null
  }

  private async fetchYandexTranslator({
    sourceLanguageCode = 'en',
    targetLanguageCode = 'ru',
    texts,
    glossaryPairs,
  }: {
    sourceLanguageCode?: string
    targetLanguageCode?: string
    texts: string[]
    glossaryPairs?: { sourceText: string; translatedText: string }[]
  }) {
    if (texts.length <= 0) {
      new AppException('400', `Отсутсвуют значения для перевода`)
    }
    const glossaryConfig =
      glossaryPairs && glossaryPairs.length > 0
        ? {
            glossaryData: {
              glossaryPairs,
            },
          }
        : undefined
    const response = await fetch('https://translate.api.cloud.yandex.net/translate/v2/translate', {
      method: 'POST',
      headers: {
        Authorization: `API-key ${process.env.TRANSLATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folderId: process.env.TRANSLATE_FOLDER_ID,
        sourceLanguageCode,
        targetLanguageCode,
        texts,
        glossaryConfig,
        speller: false,
      }),
    })

    const data = await response.json()
    return data as {
      translations: {
        text: string[]
      }
    }
  }

  async transcribeCitiesWithLlm() {
    const BATCH_SIZE = 5000
    let offset = 0
    let batchNumber = 1

    while (true) {
      const cities = await this.geonamesCity.findAll({
        attributes: ['asciiname'],
        where: {
          asciiname_ru: { [Op.or]: [null, ''] },
        },
        group: ['asciiname'],
        order: [['asciiname', 'ASC']],
        limit: BATCH_SIZE,
        offset,
      } as any)

      if (cities.length === 0) break

      this.logger.log(`🌀 Батч #${batchNumber} (${cities.length} уникальных названий)`)

      for (let i = 0; i < cities.length; i++) {
        const { asciiname } = cities[i]

        try {
          const transcription = await this.fetchLlmTranscription(asciiname)

          if (transcription) {
            await this.geonamesCity.update({ asciiname_ru: transcription }, {
              where: {
                asciiname,
                asciiname_ru: { [Op.or]: [null, ''] },
              },
            } as any)
            this.logger.log(`✅ ${i + 1}/${cities.length} | "${asciiname}" → ${transcription}`)
          }
        } catch (error) {
          this.logger.error(`❌ Ошибка: "${asciiname}" — ${error.message}`)
        }

        await this.sleep(10)
      }

      offset += BATCH_SIZE
      batchNumber++
    }

    this.logger.log('🎉 Транскрипция завершена.')
  }

  async translateCityInBatches() {
    const BATCH_SIZE = 10000
    let offset = 0
    let batch: GeonamesCity[] = []
    let batchNumber = 1

    while (true) {
      batch = await this.geonamesCity.findAll({
        where: {
          asciiname_ru: { [Op.is]: null },
          country: 'BG',
        } as any,
        limit: BATCH_SIZE,
        offset,
        order: [['geonameid', 'ASC']],
      })
      // я тут так пишу, чтобы случайно не включилось, убрать return если нужно использовать
      //return

      if (batch.length === 0) break

      this.logger.log(`Начинаем обработку батча #${batchNumber}, записей: ${batch.length}`)

      for (let i = 0; i < batch.length; i++) {
        const city = batch[i]
        try {
          const response = await this.fetchYandexTranslator({
            texts: [city.asciiname],
          })
          const translated = response.translations[0].text
          if (translated) {
            await this.geonamesCity.update(
              { asciiname_ru: translated },
              { where: { geonameid: city.geonameid } },
            )
            this.logger.log(`✅ ${i + 1}/${batch.length} | "${city.asciiname}" → ${translated}`)
          }
        } catch (error) {
          this.logger.error(`❌ ${i + 1}/${batch.length} | Ошибка для "${city.asciiname}": ${error.message}`)
        }
        await this.sleep(300)
      }

      this.logger.log(`Батч #${batchNumber} завершён ✅`)
      offset += BATCH_SIZE
      batchNumber++
    }

    this.logger.log('✅ Перевод всех записей завершён.')
  }

  async translateAdmin2InBatches() {
    const BATCH_SIZE = 10000
    let offset = 0
    let batch: GeonamesAdmin2[] = []
    let batchNumber = 1

    while (true) {
      batch = await this.geonamesAdmin2.findAll({
        where: {
          asciiname_ru: { [Op.is]: null },
        } as any,
        limit: BATCH_SIZE,
        offset,
        order: [['geonameid', 'ASC']],
      })
      // я тут так пишу, чтобы случайно не включилось, убрать return если нужно использовать
      return

      if (batch.length === 0) break

      this.logger.log(`Начинаем обработку батча #${batchNumber}, записей: ${batch.length}`)

      for (let i = 0; i < batch.length; i++) {
        const admin = batch[i]
        try {
          const response = await this.fetchYandexTranslator({
            texts: [admin.asciiname],
            glossaryPairs: ADMIN_2_GLOSSARY,
          })
          const translated = response.translations[0].text
          if (translated) {
            await this.geonamesAdmin2.update(
              { asciiname_ru: translated },
              { where: { geonameid: admin.geonameid } },
            )
            this.logger.log(`✅ ${i + 1}/${batch.length} | "${admin.asciiname}" → ${translated}`)
          }
        } catch (error) {
          this.logger.error(`❌ ${i + 1}/${batch.length} | Ошибка для "${admin.asciiname}": ${error.message}`)
        }
        await this.sleep(300)
      }

      this.logger.log(`Батч #${batchNumber} завершён ✅`)
      offset += BATCH_SIZE
      batchNumber++
    }

    this.logger.log('✅ Перевод всех записей завершён.')
  }

  async translateAdmin1() {
    const admins1 = await this.geonamesAdmin1.findAll({
      where: {
        asciiname_ru: { [Op.is]: null },
      } as any,
    })
    // я тут так пишу, чтобы случайно не включилось, убрать return если нужно использовать
    return
    for (let i = 0; i < admins1.length; i++) {
      const admin = admins1[i]

      try {
        const response = await this.fetchYandexTranslator({ texts: [admin.asciiname] })
        const translated = response.translations[0].text
        if (translated) {
          await this.geonamesAdmin1.update(
            { asciiname_ru: translated },
            { where: { geonameid: admin.geonameid } },
          )
          this.logger.log(`Успешно записали "${admin.asciiname}": ${translated}`)
        }
      } catch (error) {
        this.logger.error(`Ошибка при переводе "${admin.asciiname}": ${error.message}`)
      }
      await this.sleep(300) // пауза, чтобы не попасть под лимиты
    }
    this.logger.log('Перевод завершён ✅')
  }

  async translateCountries() {
    const countries = await this.countryModel.findAll({
      where: {
        country_ru: { [Op.is]: null },
      } as any,
    })

    if (countries.length === 0) {
      this.logger.log('Все страны уже переведены 🎉')
      return
    }

    // я тут так пишу, чтобы случайно не включилось, убрать return если нужно использовать
    return
    for (let i = 0; i < countries.length; i++) {
      const country = countries[i]

      try {
        const response = await this.fetchYandexTranslator({ texts: [country.name] })
        const translated = response.translations[0].text
        if (translated) {
          await this.countryModel.update({ name_ru: translated }, { where: { iso: country.iso } })
          this.logger.log(`Успешно записали "${country.name_ru}": ${translated}`)
        }
      } catch (error) {
        this.logger.error(`Ошибка при переводе "${country.name}": ${error.message}`)
      }
      await this.sleep(300) // пауза, чтобы не попасть под лимиты
    }
    this.logger.log('Перевод завершён ✅')
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

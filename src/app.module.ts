import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { RouterModule } from '@nestjs/core'

import { LocalityModule } from './locality/locality.module'
import { AstroModule } from './astro/astro.module'
import { AstroDictionaryModule } from './astro/astro-dictionary/astro-dictionary.module'
import { TranslateModule } from './translate/translate.module'
import { LlmModule } from './llm/llm.module'

import { GeonamesCity } from './locality/models/geonames-city.model'
import { GeonamesAdmin1 } from './locality/models/geonames-admin-1.model'
import { GeonamesAdmin2 } from './locality/models/geonames-admin-2.model'
import { GeonamesCountry } from './locality/models/geonames-country.model'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.SQL_HOST,
      port: Number(process.env.SQL_PORT ?? 3306),
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB,
      models: [GeonamesCity, GeonamesAdmin1, GeonamesAdmin2, GeonamesCountry],
      autoLoadModels: true,
      synchronize: false,
    }),

    // Вложенность модулей через RouterModule
    RouterModule.register([
      {
        path: 'astro',
        module: AstroModule,
        children: [
          {
            path: 'dictionary',
            module: AstroDictionaryModule,
          },
        ],
      },
    ]),

    LocalityModule,
    AstroModule,
    AstroDictionaryModule,
    TranslateModule,
    LlmModule,
  ],
})
export class AppModule {}

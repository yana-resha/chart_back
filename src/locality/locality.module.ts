import { Module } from '@nestjs/common'
import { LocalityService } from './locality.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { LocalityController } from './locality.controller'
import { HttpModule } from '@nestjs/axios'
import { GeonamesCountry } from './models/geonames-country.model'
import { GeonamesAdmin1 } from './models/geonames-admin-1.model'
import { GeonamesAdmin2 } from './models/geonames-admin-2.model'
import { GeonamesCity } from './models/geonames-city.model'

@Module({
  controllers: [LocalityController],
  providers: [LocalityService],
  imports: [
    SequelizeModule.forFeature([GeonamesCity, GeonamesCountry, GeonamesAdmin1, GeonamesAdmin2]),
    HttpModule,
  ],
  exports: [
    LocalityService,
    SequelizeModule.forFeature([GeonamesCity, GeonamesCountry, GeonamesAdmin1, GeonamesAdmin2]), // 💡 Лучше так: экспортируй только нужные модели
  ],
})
export class LocalityModule {}

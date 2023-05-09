import { ConfigurableModuleBuilder, Module } from '@nestjs/common'
import { KyselyService } from './kysely.service'
import { DialectFactoryService } from './dialect-factory.service'
import { MooncatConfigModule } from '@app/config'

const {
  ConfigurableModuleClass: KyselyConfigurableModule,
  MODULE_OPTIONS_TOKEN: KYSELY_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder({ moduleName: 'kysely' }).build()

@Module({
  exports: [ KyselyService ],
  providers: [ KyselyService, DialectFactoryService ],
  imports: [ MooncatConfigModule ],
})
export class KyselyModule extends KyselyConfigurableModule {}

export {
  KYSELY_OPTIONS_TOKEN,
}
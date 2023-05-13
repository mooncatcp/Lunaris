import { MooncatConfigService } from '@app/config/config.service'
import { createApp } from './app.factory'

async function bootstrap() {
  const app = await createApp()
  const config = app.get(MooncatConfigService)
  
  await app.listen(config.appPort)
}
bootstrap()

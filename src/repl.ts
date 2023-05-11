import { repl } from '@nestjs/core'
import { AppModule } from './app.module.js'

async function bootstrap() {
  await repl(AppModule)
}

bootstrap()
import { createApp } from './app.factory'
import { SpelunkerModule } from 'nestjs-spelunker'

async function bootstrap() {
  const app = await createApp(false)
  const graph = SpelunkerModule.findGraphEdges(
    SpelunkerModule.graph(SpelunkerModule.explore(app)),
  )
  const mermaidEdges = graph.map(
    ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  )
  console.log(mermaidEdges.join('\n'))
}

bootstrap()
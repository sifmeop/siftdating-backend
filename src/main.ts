import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module'
;(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString())
  return int ?? this.toString()
}

const PORT = 5000

async function main() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    // origin: ['http://localhost:3000', 'https://siftdating-frontend.vercel.app'],
    origin: '*',
    credentials: true
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useWebSocketAdapter(new IoAdapter(app))
  await app.listen(PORT)
}

main()

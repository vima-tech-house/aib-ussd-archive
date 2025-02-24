import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './modules/main/app.module';
import { setupSwagger } from './swagger';
import { loggerMiddleware } from 'common/middlewares/logger.middleware';

declare const module: any;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });
    const logger = new Logger('Main');
    const globalPrefix = '/api';

    
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix(globalPrefix);
    setupSwagger(app, globalPrefix);
    // app.use(helmet());
    app.use(morgan('dev'));
    app.use(loggerMiddleware);

    await app.listen(AppModule.port);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }

    let baseUrl = app.getHttpServer().address().address;
    if (baseUrl === '0.0.0.0' || baseUrl === '::') {
      baseUrl = 'localhost';
    }
    const url = `http://${baseUrl}:${AppModule.port}${globalPrefix}`;

    logger.log(
      `Application is running on: http://${baseUrl}:${AppModule.port}${globalPrefix}`,
    );
    if (AppModule.isDev) {
      logger.log(`API Documentation available at ${url}/docs`);
    }
  } catch (error) {
    process.exit(1);
  }
}

bootstrap();

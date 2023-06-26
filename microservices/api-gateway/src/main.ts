import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as momentTimezone from 'moment-timezone';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { TimeoutInterceptor } from './interceptors/timout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  //overwrite Date object to set timezone and format
  Date.prototype.toJSON = function (): any {
    return momentTimezone(this)
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  await app.listen(8282);
}
bootstrap();

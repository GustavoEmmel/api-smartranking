import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Observable } from 'rxjs';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('api/v1')
export class AppController {
  private logger = new Logger(AppController.name);
  private clientAdminBackend: ClientProxy;

  constructor() {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'admin-backend',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  @Put('categories/:_id')
  @UsePipes(ValidationPipe)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('_id') _id: string,
  ) {
    this.clientAdminBackend.emit('update-category', {
      id: _id,
      category: updateCategoryDto,
    });
  }

  @Post('categories')
  @UsePipes(ValidationPipe)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    this.clientAdminBackend.emit('create-category', createCategoryDto);
  }

  @Get('categories')
  getCategories(@Query('categoryId') _id: string): Observable<any> {
    return this.clientAdminBackend.send('get-categories', _id ? _id : '');
  }
}

import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Category } from './interfaces/categories/category.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: Category,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`category: ${JSON.stringify(category)}`);
    try {
      await this.appService.createCategory(category);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('err', err);
    }
  }

  @EventPattern('update-category')
  async updateCategory(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`category data: ${JSON.stringify(data)}`);
    const _id: string = data.id;
    const category: Category = data.category;
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.appService.updateCategory(_id, category);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('err', err);
    }
  }

  @MessagePattern('get-categories')
  async getCategories(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return this.appService.getCategoryById(_id);
      }
      return this.appService.getAllCategories();
    } finally {
      await channel.ack(originalMsg);
    }
  }
}

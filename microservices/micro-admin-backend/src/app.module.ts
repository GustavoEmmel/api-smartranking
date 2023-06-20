import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from './interfaces/players/player.schema';
import { CategorySchema } from './interfaces/categories/category.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/admin-backend', {}),
    MongooseModule.forFeature([
      { name: 'Player', schema: PlayerSchema }, 
      { name: 'Category', schema: CategorySchema }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

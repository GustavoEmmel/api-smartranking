import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Category } from './interfaces/category.interface';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  getCategories(): Promise<Array<Category>> {
    return this.categoriesService.getAll();
  }

  @Get('/:category')
  getCategoryById(@Param('category') category: string): Promise<Category> {
    return this.categoriesService.getById(category);
  }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('category') category: string,
  ): Promise<void> {
    return this.categoriesService.update(category, updateCategoryDto);
  }

  @Post('/:category/players/:id')
  addPlayerToCategory(@Param() params: string[]): Promise<void> {
    return this.categoriesService.addPlayerToCategory(params);
  }
}

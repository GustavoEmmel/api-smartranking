import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './interfaces/categories/category.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {}

  async updateCategory(
    category: string,
    updateCategoryDto: Category,
  ): Promise<void> {
    await this.getCategoryById(category);
    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: updateCategoryDto })
      .exec();
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      const newCategory = new this.categoryModel(category);
      return await newCategory.save();
    } catch (err) {
      throw new RpcException(err.message);
    }
  }

  getAllCategories(): Promise<Array<Category>> {
    return this.categoryModel.find().populate('players').exec();
  }

  async getCategoryById(category: string): Promise<Category> {
    const categoryFounded = await this.categoryModel
      .findOne({ category })
      .populate('players')
      .exec();
    if (!categoryFounded) {
      throw new NotFoundException(`Category ${category} not exists`);
    }

    return categoryFounded;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './interfaces/category.interface';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { category } = createCategoryDto;

    const categoryFounded = await this.categoryModel
      .findOne({ category })
      .exec();
    if (categoryFounded) {
      throw new BadRequestException(`Category ${category} already exists`);
    }

    const newCategory = new this.categoryModel(createCategoryDto);
    return await newCategory.save();
  }

  getAll(): Promise<Array<Category>> {
    return this.categoryModel.find().populate('players').exec();
  }

  async getById(category: string): Promise<Category> {
    const categoryFounded = await this.categoryModel
      .findOne({ category })
      .populate('players')
      .exec();
    if (!categoryFounded) {
      throw new NotFoundException(`Category ${category} not exists`);
    }

    return categoryFounded;
  }

  async update(
    category: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    await this.getById(category);
    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: updateCategoryDto })
      .exec();
  }

  async addPlayerToCategory(params: string[]): Promise<void> {
    const category = params['category'];
    const id = params['id'];
    const categoryFounded = await this.getById(category);

    await this.playersService.getById(id);

    const playerInCategory = await this.categoryModel
      .find({ category })
      .where('players')
      .in(id)
      .exec();

    if (playerInCategory.length > 0) {
      throw new BadRequestException(
        `Player ${id} already belongs to category ${category}`,
      );
    }

    categoryFounded.players.push(id);
    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: categoryFounded })
      .exec();
  }

  async getPlayerCategories(playerId: any): Promise<Category> {
    const players = await this.playersService.getAll();
    const playerFilter = players.filter((player) => player._id == playerId);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`Id ${playerId} don't belong to a player`);
    }

    return await this.categoryModel
      .findOne()
      .where('players')
      .in(playerId)
      .exec();
  }
}

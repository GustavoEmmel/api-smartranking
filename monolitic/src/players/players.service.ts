import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdatePlayerDto } from './dtos/update-player.dto';
@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModule: Model<Player>,
  ) {}

  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const { email } = createPlayerDto;
    const player = await this.playerModule.findOne({ email }).exec();
    if (player) {
      throw new BadRequestException(
        `Player with email ${email} already created`,
      );
    }
    const newPlayer = new this.playerModule(createPlayerDto);
    return await newPlayer.save();
  }

  async updatePlayer(
    _id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<void> {
    // const { email } = createPlayerDto;
    const player = await this.playerModule.findOne({ _id }).exec();
    if (!player) {
      throw new NotFoundException(`Player with id ${_id} not founded`);
    }

    await this.playerModule
      .findOneAndUpdate({ _id }, { $set: updatePlayerDto })
      .exec();
  }

  async getAll(): Promise<Player[]> {
    return await this.playerModule.find().exec();
  }

  async getById(_id: string): Promise<Player> {
    const player = await this.playerModule.findOne({ _id }).exec();
    if (!player) {
      throw new NotFoundException(`Player with e-mail ${_id} was not founded`);
    }
    return player;
  }

  async deletePlayer(_id: string): Promise<any> {
    const player = await this.playerModule.findOne({ _id }).exec();
    if (!player) {
      throw new NotFoundException(`Player with e-mail ${_id} was not founded`);
    }

    return await this.playerModule.deleteOne({ _id }).exec();
  }
}

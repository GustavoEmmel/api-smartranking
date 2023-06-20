import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { PlayersService } from './players.service';
import { ValidationParametersPipe } from '../common/pipes/validation-parameters.pipe';
import { UpdatePlayerDto } from './dtos/update-player.dto';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}
  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    return await this.service.createPlayer(createPlayerDto);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<void> {
    await this.service.updatePlayer(_id, updatePlayerDto);
  }

  @Get()
  async getPlayers(): Promise<Player[]> {
    return this.service.getAll();
  }

  @Get('/:_id')
  async getPlayersById(
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<Player> {
    return this.service.getById(_id);
  }

  @Delete('/:_id')
  async deletePlayer(
    @Param('_id', ValidationParametersPipe) _id: string,
  ): Promise<void> {
    this.service.deletePlayer(_id);
  }
}

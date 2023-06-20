import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { Challenge } from './interfaces/challenge.interface';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { SetChallengeMatchDto } from './dtos/set-challenge-match.dto';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private readonly challengeService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    this.logger.log(`create challenge ${JSON.stringify(createChallengeDto)}`);
    return this.challengeService.createChallenge(createChallengeDto);
  }

  @Get()
  get(@Query('PlayerId') _id: string): Promise<Array<Challenge>> {
    return _id
      ? this.challengeService.getPlayerChallenges(_id)
      : this.challengeService.getAll();
  }

  @Put('/:challenge')
  async update(
    @Body(ChallengeStatusValidationPipe) udpateChallengeDto: UpdateChallengeDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    await this.challengeService.update(_id, udpateChallengeDto);
  }

  @Post('/:challenge/match/')
  async setChallengeMatch(
    @Body(ValidationPipe) setChallengeMatchDto: SetChallengeMatchDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    await this.challengeService.setChallengeMatch(_id, setChallengeMatchDto);
  }

  @Delete('/:_id')
  async delete(@Param('_id') _id: string): Promise<void> {
    await this.challengeService.delete(_id);
  }
}

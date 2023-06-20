import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Challenge, Match } from './interfaces/challenge.interface';
import { PlayersService } from 'src/players/players.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { SetChallengeMatchDto } from './dtos/set-challenge-match.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playerService: PlayersService,
    private readonly categoryService: CategoriesService,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);
  async createChallenge(
    createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    const players = await this.playerService.getAll();
    createChallengeDto.players.map((playerDto) => {
      const playerFilter = players.filter(
        (player) => (player._id = playerDto._id),
      );
      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `The id ${playerDto._id} don't belong to a player`,
        );
      }
    });

    const requesterIsMatchPlayer = createChallengeDto.players.filter(
      (player) => player._id == createChallengeDto.requester,
    );

    if (requesterIsMatchPlayer.length == 0) {
      throw new BadRequestException('Requestor must be a player on the match');
    }

    const playerCategory = await this.categoryService.getPlayerCategories(
      createChallengeDto.requester,
    );

    if (!playerCategory) {
      throw new BadRequestException(
        'The requester must be registered in one category',
      );
    }

    const challengeCreated = new this.challengeModel(createChallengeDto);
    challengeCreated.category = playerCategory.category;
    challengeCreated.dateTimeRequest = new Date();
    challengeCreated.status = ChallengeStatus.PENDING;
    this.logger.log(`challenge created ${JSON.stringify(challengeCreated)}`);
    return challengeCreated.save();
  }

  getAll(): Promise<Array<Challenge>> {
    return this.challengeModel
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async getPlayerChallenges(_id: any): Promise<Array<Challenge>> {
    const players = await this.playerService.getAll();

    const playerFilter = players.filter((player) => player._id == _id);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`Id ${_id} is not a player`);
    }

    return this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async update(
    _id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    const challengeFounded = await this.challengeModel.findById(_id).exec();

    if (!challengeFounded) {
      throw new NotFoundException(`Challenge ${_id} not found`);
    }

    if (updateChallengeDto.status) {
      challengeFounded.dateTimeResponse = new Date();
    }

    challengeFounded.status = updateChallengeDto.status;
    challengeFounded.dateTimeChallenge = updateChallengeDto.dateTimeChallenge;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: challengeFounded })
      .exec();
  }

  async setChallengeMatch(
    _id: string,
    setChallengeMatchDto: SetChallengeMatchDto,
  ): Promise<void> {
    const challengeFounded = await this.challengeModel.findById(_id).exec();

    if (!challengeFounded) {
      throw new BadRequestException(`Challenge ${_id} not founded`);
    }

    const playerFilter = challengeFounded.players.filter(
      (player) => player._id == setChallengeMatchDto.def,
    );

    if (playerFilter.length == 0) {
      throw new BadRequestException(`Player don't belong to challenge`);
    }

    this.logger.log(`challenge founded: ${challengeFounded}`);
    this.logger.log(`player filter ${playerFilter}`);

    const matchCreated = new this.matchModel(setChallengeMatchDto);
    matchCreated.category = challengeFounded.category;
    matchCreated.players = challengeFounded.players;

    const result = await matchCreated.save();

    challengeFounded.status = ChallengeStatus.DONE;
    challengeFounded.match = result._id;
    try {
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challengeFounded })
        .exec();
    } catch (err) {
      await this.matchModel.deleteOne({ _id: result._id }).exec();
      throw new InternalServerErrorException();
    }
  }

  async delete(_id: string): Promise<void> {
    const challengeFounded = await this.challengeModel.findById(_id).exec();

    if (!challengeFounded) {
      throw new BadRequestException(`Challenge ${_id} not found`);
    }

    challengeFounded.status = ChallengeStatus.CANCEL;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: challengeFounded })
      .exec();
  }
}

import { IsNotEmpty } from 'class-validator';
import { Player } from 'src/players/interfaces/player.interface';
import { Match } from '../interfaces/challenge.interface';

export class SetChallengeMatchDto {
  @IsNotEmpty()
  def: Player;

  @IsNotEmpty()
  match: Array<Match>;
}

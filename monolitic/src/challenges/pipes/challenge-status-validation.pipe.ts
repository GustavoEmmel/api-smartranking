import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [
    ChallengeStatus.ACCEPT,
    ChallengeStatus.DENIED,
    ChallengeStatus.CANCEL,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.isValid(status)) {
      throw new BadRequestException(`${status} is not allowed`);
    }

    return value;
  }

  private isValid(status: any) {
    const idx = this.allowedStatus.indexOf(status);
    return idx !== -1;
  }
}

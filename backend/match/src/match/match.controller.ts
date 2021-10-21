import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchResponse } from './match-response';

@ApiTags('Server')
@Controller('api')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /*
  Gets a match for a user if there is a matching user
  */
  @Get('match')
  async getMatch(
    @Query('id') id: string,
    @Query('difficulty') difficulty: string,
    @Query('language') language: string
  ): Promise<MatchResponse> {
    return this.matchService.getMatch(id, difficulty, language);
  }
}

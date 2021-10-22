import { Injectable } from '@nestjs/common';
import { MatchResponse } from './match-response';
import { RedisCacheService } from '../redis/redisCache.service';

@Injectable()
export class MatchService {
  constructor(private readonly redisService: RedisCacheService) {}

  async getMatch(
    id: string,
    difficulty: string,
    language: string
  ): Promise<MatchResponse> {
    const key = `${difficulty}_${language}`;

    await this.createMatch(key, id);

    for (let retries = 0; retries < 6; retries++) {
      const res = await this.retry(key, id);
      if (res.status) {
        return res;
      }
      await this.sleep(5000);
    }

    return {
      status: false,
      id: id,
    };
  }

  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async retry(key: string, id: string): Promise<MatchResponse> {
    return new Promise(async (resolve) => {
      const data = await this.redisService.get(key);
      const map = JSON.parse(data);
      console.log(map);

      // Terminate if it gets matched with another user
      if (map[id] !== '') {
        console.log(`${id} has been matched with ${map[id]}`);
        return resolve({
          status: true,
          id: id,
          partnerId: map[id],
        });
      }

      for (const [otherId, partnerId] of Object.entries(map)) {
        if (otherId !== id && partnerId === '') {
          map[id] = otherId;
          map[otherId] = id;
          await this.redisService.set(key, JSON.stringify(map));
          console.log(`Successfully matched ${id} with ${otherId}`);
          return resolve({
            status: true,
            id: id,
            partnerId: otherId,
          });
        }
      }

      return resolve({
        status: false,
        id: id,
      });
    });
  }

  async createMatch(key: string, id: string) {
    const data = await this.redisService.get(key);
    const map = data !== null ? JSON.parse(data) : {};
    if (!(id in map)) {
      console.log(`Setting ${id} in map`);
      map[id] = '';
      await this.redisService.set(key, JSON.stringify(map));
    }
    console.log(`Starting match for ${id}`);
  }
}

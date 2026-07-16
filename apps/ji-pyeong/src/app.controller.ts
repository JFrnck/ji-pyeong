import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getGreeting(): { message: string; version: string } {
    return this.appService.getGreeting();
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}

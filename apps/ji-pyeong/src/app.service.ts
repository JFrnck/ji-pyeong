import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getGreeting(): { message: string; version: string } {
    return {
      message:
        '¡Hola! Soy ji-pyeong, tu asistente personal. Estoy listo para ayudarte.',
      version: '0.1.0',
    };
  }
}

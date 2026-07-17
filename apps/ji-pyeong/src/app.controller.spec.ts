import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getGreeting', () => {
    it('devuelve el saludo de ji-pyeong con message y version', () => {
      const result = appController.getGreeting();
      expect(result.message).toBe(
        '¡Hola! Soy ji-pyeong, tu asistente personal. Estoy listo para ayudarte.',
      );
      expect(result.version).toBe('0.1.0');
    });
  });

  describe('getHealth', () => {
    it('devuelve status ok', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
    });
  });
});

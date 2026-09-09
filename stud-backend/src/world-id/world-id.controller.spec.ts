import { Test, TestingModule } from '@nestjs/testing';
import { WorldIdController } from './world-id.controller.js';

describe('WorldIdController', () => {
  let controller: WorldIdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorldIdController],
    }).compile();

    controller = module.get<WorldIdController>(WorldIdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

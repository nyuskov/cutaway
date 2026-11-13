import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../src/database/prisma.service';
import { HealthController } from '../../src/health/health.controller';

describe('HealthController', () => {
  it('reports a healthy database', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const controller = new HealthController(prisma as unknown as PrismaService);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'ok',
      database: 'up',
    });
  });

  it('returns 503 when the database is unavailable', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const controller = new HealthController(prisma as unknown as PrismaService);

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

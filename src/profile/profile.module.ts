import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { ExperienceResolver } from './experience.resolver';
import { ProfileLoaders } from './profile.loaders';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { ProjectResolver } from './project.resolver';

@Module({
  imports: [PrismaModule],
  providers: [
    ProfileRepository,
    ProfileService,
    ProfileLoaders,
    ProfileResolver,
    ExperienceResolver,
    ProjectResolver,
  ],
  exports: [ProfileLoaders],
})
export class ProfileModule {}

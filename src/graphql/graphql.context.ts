import type { ProfileLoadersMap } from '../profile/profile.loaders';

export interface GraphQLContext {
  loaders: ProfileLoadersMap;
}

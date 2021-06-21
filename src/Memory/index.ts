import { JobCollection } from './JobCollection'
import { TaskCollection } from './TaskCollection'
import { VillageCollection } from './VillageCollection'
import { MissionCollection } from './MissionCollection'

export const Collections = {
  tasks: new TaskCollection(),
  jobs: new JobCollection(),
  villages: new VillageCollection(),
  missions: new MissionCollection()
}

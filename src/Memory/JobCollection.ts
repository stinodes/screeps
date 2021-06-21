import { Job, JobEntry } from '../Jobs/Job'
import { Collection } from './Collection'
import { Peasant } from '../Jobs/Peasant'
import { Upgrader } from '../Jobs/Upgrader'
import { Builder } from '../Jobs/Builder'

export class JobCollection extends Collection<Job<JobEntry>> {
  public segment = 'jobs'
  public getClass(type: string): new (id: string) => Job<JobEntry> {
    switch (type) {
      case 'peasant':
        return Peasant
      case 'upgrader':
        return Upgrader
      case 'builder':
        return Builder
      default:
        return Peasant
    }
  }
}

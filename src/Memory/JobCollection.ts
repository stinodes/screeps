import { Job, JobEntry } from '../Jobs/Job'
import { Collection } from './Collection'
import { Peasant } from '../Jobs/Peasant'
import { Upgrader } from '../Jobs/Upgrader'
import { Builder } from '../Jobs/Builder'
import { Courier } from '../Jobs/Courier'
import { Settler } from '../Jobs/Settler'

export class JobCollection extends Collection<Job<JobEntry>> {
  public segment = 'jobs'
  public getClass(type: string): new (id: string) => Job<JobEntry> {
    switch (type) {
      case 'settler':
        return Settler
      case 'peasant':
        return Peasant
      case 'upgrader':
        return Upgrader
      case 'courier':
        return Courier
      case 'builder':
        return Builder
      default:
        throw new Error('Not a matching job')
    }
  }
}

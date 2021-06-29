import { JobEntry, Job } from './Job'
import { Collect } from '../Tasks/Collect'
import { Stash } from '../Tasks/Stash'
import { ResourceTarget } from '../Target/ResourceTarget'
import { StoreTarget } from '../Target/StoreTarget'

type Tasks = Stash | Collect
type CourierEntry = JobEntry
export class Courier extends Job<CourierEntry, Tasks> {
  public type: 'courier' = 'courier'
  public body = [
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    CARRY,
    CARRY,
    CARRY,
    CARRY,
    CARRY,
    CARRY
  ]

  protected getNextTask(finishedTask?: Tasks): Tasks {
    const resourceTarget = ResourceTarget.fromJob(ResourceTarget, this)
    const stashTarget = StoreTarget.fromJob(StoreTarget, this)
    switch (finishedTask?.type) {
      case 'stash':
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0)
          return this.getStashTask(stashTarget)
        return this.getCollectTask(resourceTarget)
      default: {
        if (
          this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ||
          !resourceTarget.exists
        )
          return this.getStashTask(stashTarget)
        return this.getCollectTask(resourceTarget)
      }
    }
  }
}

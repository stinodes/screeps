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

  protected getNextTask(): Tasks {
    if (this.step === 'stashing') {
      const stashTarget = StoreTarget.fromJob(StoreTarget, this)
      if (stashTarget.exists) return this.getStashTask(stashTarget)
    }
    const resourceTarget = ResourceTarget.fromJob(ResourceTarget, this)
    return this.getCollectTask(resourceTarget)
  }
  protected onTaskFinish(): void {
    if (this.getFreeCapacity(RESOURCE_ENERGY) === 0) this.step = 'stashing'
    else if (this.getUsedCapacity(RESOURCE_ENERGY) === 0)
      this.step = 'gathering'
  }
}

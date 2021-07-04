import { JobEntry, Job } from './Job'
import { Collect } from '../Tasks/Collect'
import { Stash } from '../Tasks/Stash'
import { ResourceTarget } from '../Target/ResourceTarget'
import { StoreTarget } from '../Target/StoreTarget'
import { Load } from '../Tasks/Load'
import { LoadTarget } from '../Target/LoadTarget'
import { TransferTarget } from '../Target/TransferTarget'
import { Transfer } from '../Tasks/Transfer'

type Tasks = Stash | Collect | Load | Transfer
type CourierEntry = JobEntry & { flag: string }
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
  public flag: Flag
  public transferable = false

  public load(memory: CourierEntry): void {
    super.load(memory)
    this.flag = Game.flags[memory.flag]
  }
  public save(): CourierEntry {
    const memory = super.save()
    memory.flag = this.flag.name
    return memory
  }

  protected getNextTask(): Tasks | null {
    const stashTarget = StoreTarget.fromJob(StoreTarget, this)
    const transferTarget = TransferTarget.fromJob(TransferTarget, this)
    if (this.step === 'stashing') {
      if (stashTarget.exists) return this.getStashTask(stashTarget)
      if (transferTarget.exists) return this.getTransferTask(transferTarget)
    }

    const container = this.flag.pos
      .lookFor(LOOK_STRUCTURES)
      .filter(structure => structure.structureType === STRUCTURE_CONTAINER)[0]
    const resource = this.flag.pos
      .lookFor(LOOK_RESOURCES)
      .filter(r => r.amount >= 50)[0]

    const resourceTarget = ResourceTarget.fromTarget(
      ResourceTarget,
      this.mission.village,
      resource
    ) as ResourceTarget
    if (resourceTarget.exists) return this.getCollectTask(resourceTarget)

    const loadTarget = LoadTarget.fromTarget(
      LoadTarget,
      this.mission.village,
      container
    ) as LoadTarget
    if (loadTarget.exists) return this.getLoadTask(loadTarget)

    if (this.getUsedCapacity() > 0) {
      if (stashTarget.exists) return this.getStashTask(stashTarget)
      if (transferTarget.exists) return this.getTransferTask(transferTarget)
    }

    return null
  }
  protected onTaskFinish(): void {
    if (this.getFreeCapacity(RESOURCE_ENERGY) === 0) this.step = 'stashing'
    else if (this.getUsedCapacity(RESOURCE_ENERGY) === 0)
      this.step = 'gathering'
  }
}

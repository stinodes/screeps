import { JobEntry, Job } from './Job'
import { Collect } from '../Tasks/Collect'
import { Stash } from '../Tasks/Stash'
import { StoreTarget } from '../Target/StoreTarget'
import { Load } from '../Tasks/Load'
import { LoadTarget } from '../Target/LoadTarget'
import { TransferTarget } from '../Target/TransferTarget'
import { Transfer } from '../Tasks/Transfer'
import { Body } from './Body'
import { ResourceTarget } from '../Target/ResourceTarget'

type Tasks = Stash | Collect | Load | Transfer
type CourierEntry = JobEntry
export class Courier extends Job<CourierEntry, Tasks> {
  public type: 'courier' = 'courier'
  public transferable = false

  public body = Body.create()
    .addDynamicPart(MOVE, 1 / 3)
    .addDynamicPart(CARRY, 2 / 3)

  public load(memory: CourierEntry): void {
    super.load(memory)
  }
  public save(): CourierEntry {
    const memory = super.save()
    return memory
  }

  protected getNextTask(): Tasks | null {
    if (this.getUsedCapacity() !== 0) {
      return this.getDepositTask()
    }

    const loadTask = this.getLoadCourierTask()
    if (loadTask) return loadTask

    return null
  }

  protected getLoadCourierTask(): Load | Collect | null {
    const container = (
      this.room
        .find(FIND_STRUCTURES)
        .filter(
          structure =>
            structure.structureType === STRUCTURE_CONTAINER &&
            structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
              this.creep.store.getCapacity(RESOURCE_ENERGY) * 0.3
        ) as StructureContainer[]
    ).sort(
      (c1, c2) =>
        c2.store.getUsedCapacity(RESOURCE_ENERGY) -
        c1.store.getUsedCapacity(RESOURCE_ENERGY)
    )

    const loadTarget = LoadTarget.fromTarget(
      LoadTarget,
      this.mission.village,
      container[0] || null
    ) as LoadTarget
    if (
      loadTarget.exists &&
      (
        loadTarget.target?.store as Store<RESOURCE_ENERGY, false>
      ).getUsedCapacity(RESOURCE_ENERGY) > 100
    )
      return this.getLoadTask(loadTarget)

    const resources = this.room
      .find(FIND_DROPPED_RESOURCES, {
        filter: r =>
          r.amount >= this.creep.store.getCapacity(RESOURCE_ENERGY) * 0.3
      })
      .sort((r1, r2) => r2.amount - r1.amount)
    const resourceTarget = ResourceTarget.fromTarget(
      ResourceTarget,
      this.mission.village,
      resources[0]
    ) as ResourceTarget
    console.log(
      'resource exists?',
      resourceTarget.exists,
      resourceTarget.target?.amount
    )
    if (resourceTarget.exists) return this.getCollectTask(resourceTarget)

    return null
  }

  protected getDepositTask(): Tasks | null {
    const stashTarget = StoreTarget.fromJob(StoreTarget, this)
    const transferTarget = TransferTarget.fromJob(TransferTarget, this)
    if (
      stashTarget.exists &&
      stashTarget.target?.structureType !== STRUCTURE_STORAGE
    )
      return this.getStashTask(stashTarget)

    if (transferTarget.exists) return this.getTransferTask(transferTarget)
    if (stashTarget.exists) return this.getStashTask(stashTarget)
    return null
  }

  protected onTaskFinish(): void {
    if (this.getFreeCapacity(RESOURCE_ENERGY) === 0) this.step = 'stashing'
    else if (this.getUsedCapacity(RESOURCE_ENERGY) === 0)
      this.step = 'gathering'
  }
}

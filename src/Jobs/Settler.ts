import { Job, JobEntry } from './Job'
import { Harvest } from '../Tasks/Harvest'
import { Stash } from '../Tasks/Stash'
import { StoreTarget } from '../Target/StoreTarget'
import { BuildTarget } from '../Target/BuildTarget'
import { Build } from '../Tasks/Build'
import { Upgrade } from '../Tasks/Upgrade'

type HarvesterEntry = JobEntry & { room: string; source: null | Id<Source> }
type Tasks = Harvest | Stash | Build | Upgrade
export class Settler extends Job<HarvesterEntry, Tasks> {
  public type: 'settler' = 'settler'
  public source: null | Source
  public body = [WORK, MOVE, MOVE, CARRY, CARRY]

  public load(memory: HarvesterEntry): void {
    super.load(memory)
    this.source = memory.source ? Game.getObjectById(memory.source) : null
  }
  public save(): HarvesterEntry {
    const memory = super.save()
    memory.source = this.source?.id || null
    return memory
  }

  protected getNextTask(finishedTask?: Tasks): Tasks {
    if (
      finishedTask?.type === 'harvest' &&
      this.creep?.store.getFreeCapacity() !== 0
    )
      return this.getHarvestTask()
    else if (
      finishedTask?.type !== 'harvest' &&
      this.creep?.store.getUsedCapacity() === 0
    )
      return this.getHarvestTask()

    const storeTarget = StoreTarget.fromJob(StoreTarget, this)
    if (storeTarget.exists) return this.getStashTask(storeTarget)

    const buildTarget = BuildTarget.fromJob(BuildTarget, this)
    if (buildTarget.exists) return this.getBuildTask(buildTarget)

    return this.getUpgradeTask()
  }

  public update(): void {
    if (!this.source)
      this.source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)

    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}

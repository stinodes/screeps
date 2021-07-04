import { Job, JobEntry } from './Job'
import { Harvest } from '../Tasks/Harvest'
import { Stash } from '../Tasks/Stash'
import { Build } from '../Tasks/Build'
import { Upgrade } from '../Tasks/Upgrade'
import { Collections } from '../Memory'
import { Repair } from '../Tasks/Repair'

type HarvesterEntry = JobEntry & { room: string; source: null | Id<Source> }
type Tasks = Harvest | Stash | Repair | Build | Upgrade
export class Settler extends Job<HarvesterEntry, Tasks> {
  public type: 'settler' = 'settler'
  public source: null | Source
  public body = [WORK, MOVE, MOVE, CARRY, CARRY]
  public step: 'gathering' | 'using' = 'gathering'
  public transferable = false

  public load(memory: HarvesterEntry): void {
    super.load(memory)
    this.source = memory.source ? Game.getObjectById(memory.source) : null
  }
  public save(): HarvesterEntry {
    const memory = super.save()
    memory.source = this.source?.id || null
    return memory
  }

  protected getNextTask(): Tasks {
    if (this.step === 'using') return this.getUseResourceTask()
    return this.getHarvestTask()
  }
  protected onTaskFinish(): void {
    if (this.getFreeCapacity() === 0) this.step = 'using'
    if (this.getUsedCapacity() === 0) this.step = 'gathering'
  }
  protected getHarvestTask(): Harvest {
    const harvest = Collections.tasks.create(
      'harvest',
      Collections.tasks.ID()
    ) as Harvest
    harvest.source = this.source
    harvest.job = this
    return harvest
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

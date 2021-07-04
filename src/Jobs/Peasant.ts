import { Job, JobEntry } from './Job'
import { Harvest } from '../Tasks/Harvest'
import { Collections } from '../Memory'
import { MoveTo } from '../Tasks/MoveTo'

type PeasantEntry = JobEntry & {
  room: string
  source: null | Id<Source>
  flag: null | string
}
type Tasks = Harvest | MoveTo
export class Peasant extends Job<PeasantEntry, Tasks> {
  public type: 'peasant' = 'peasant'
  public source: null | Source
  public flag: null | Flag
  public body = [MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK]
  public step: 'harvest' | 'move' = 'move'
  public upgrades = {
    type: 'settler',
    prop: 'source'
  }
  public transferable = false

  public load(memory: PeasantEntry): void {
    super.load(memory)
    this.source = memory.source ? Game.getObjectById(memory.source) : null
    this.flag = memory.flag ? Game.flags[memory.flag] : null
  }
  public save(): PeasantEntry {
    const memory = super.save()
    memory.source = this.source?.id || null
    memory.flag = this.flag?.name || null
    return memory
  }

  protected getNextTask(): Tasks {
    if (
      this.flag &&
      this.creep &&
      (this.creep.pos.x !== this.flag.pos.x ||
        this.creep.pos.y !== this.flag.pos.y)
    )
      return this.getMoveToTask(this.flag.pos)
    return this.getHarvestTask()
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
    if (this.creep.store.getFreeCapacity() === 0)
      this.creep.drop(RESOURCE_ENERGY)
    super.run()
  }
}

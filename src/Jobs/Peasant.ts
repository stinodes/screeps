import { Job, JobEntry } from './Job'
import { Harvest } from '../Tasks/Harvest'

type PeasantEntry = JobEntry & { room: string; source: null | Id<Source> }
export class Peasant extends Job<PeasantEntry, Harvest> {
  public type: 'peasant' = 'peasant'
  public source: null | Source
  public body = [MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK]
  public upgrades = {
    type: 'settler',
    prop: 'source'
  }

  public load(memory: PeasantEntry): void {
    super.load(memory)
    this.source = memory.source ? Game.getObjectById(memory.source) : null
  }
  public save(): PeasantEntry {
    const memory = super.save()
    memory.source = this.source?.id || null
    return memory
  }

  protected getNextTask(): Harvest {
    return this.getHarvestTask()
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

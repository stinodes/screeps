import { Task, TaskEntry } from './Task'

type HarvestEntry = TaskEntry & {
  source: string
}

export class Harvest extends Task<HarvestEntry> {
  public type = 'harvest'
  public source: null | Source

  public load(memory: HarvestEntry): void {
    super.load(memory)
    this.source = Game.getObjectById(memory.source)
  }
  public save(): HarvestEntry {
    const memory = super.save()
    memory.source = this.source?.id || ''
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    if (!creep || creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true
    return false
  }

  public update(): void {
    super.update()
    if (!this.source) this.source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
  }
  public run(): void {
    if (!this.source) return

    const result = this.harvest(this.source)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.source.pos)
  }
}

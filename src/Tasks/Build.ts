import { Task, TaskEntry } from './Task'

type BuildEntry = TaskEntry & {
  construction: string
}

export class Build extends Task<BuildEntry> {
  public type: 'build' = 'build'
  public construction: null | ConstructionSite

  public load(memory: BuildEntry): void {
    super.load(memory)
    this.construction = Game.getObjectById(memory.construction)
  }
  public save(): BuildEntry {
    const memory = super.save()
    memory.construction = this.construction?.id || ''
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    const construction = this.construction
    if (!creep || !construction) return false
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 || construction.progress >= construction.progressTotal
  }

  public run(): void {
    if (!this.construction) return

    const result = this.build(this.construction)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.construction.pos)
  }
}

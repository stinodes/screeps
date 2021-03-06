import { Task, TaskEntry } from './Task'

type BuildEntry = TaskEntry & {
  construction: Id<ConstructionSite> | null
}

export class Build extends Task<BuildEntry> {
  public type: 'build' = 'build'
  public construction: null | ConstructionSite
  public emoji = '🔨'

  public load(memory: BuildEntry): void {
    super.load(memory)
    this.construction = memory.construction
      ? Game.getObjectById(memory.construction)
      : null
  }
  public save(): BuildEntry {
    const memory = super.save()
    memory.construction = this.construction?.id || null
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    const construction = this.construction
    if (!creep || !construction) return true
    return (
      creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 ||
      construction.progress >= construction.progressTotal
    )
  }

  protected getPathStyle(): PolyStyle {
    const style = super.getPathStyle()
    style.stroke = '#cae028'
    return style
  }

  public update(): void {
    this.construction = this.construction
      ? Game.getObjectById(this.construction.id)
      : null
    super.update()
  }
  public run(): void {
    if (!this.construction) return

    const result = this.build(this.construction)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.construction.pos)
  }
}

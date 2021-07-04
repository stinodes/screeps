import { Task, TaskEntry } from './Task'

type BuildEntry = TaskEntry & {
  building: Id<Structure> | null
}

export class Repair extends Task<BuildEntry> {
  public type: 'repair' = 'repair'
  public building: null | Structure
  public emoji = '🔨'

  public load(memory: BuildEntry): void {
    super.load(memory)
    this.building = memory.building ? Game.getObjectById(memory.building) : null
  }
  public save(): BuildEntry {
    const memory = super.save()
    memory.building = this.building?.id || null
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    const building = this.building
    if (!creep || !building) return true
    if (
      building.structureType === STRUCTURE_WALL ||
      (building.structureType === STRUCTURE_RAMPART && building.hits > 5000)
    )
      return true
    return (
      this.job.getUsedCapacity(RESOURCE_ENERGY) === 0 ||
      building.hits >= building.hitsMax
    )
  }

  protected getPathStyle(): PolyStyle {
    const style = super.getPathStyle()
    style.stroke = '#81e028'
    return style
  }

  public update(): void {
    this.building = this.building ? Game.getObjectById(this.building.id) : null
    super.update()
  }
  public run(): void {
    if (!this.building) return

    const result = this.repair(this.building)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.building.pos)
  }
}

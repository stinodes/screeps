import { Task, TaskEntry } from './Task'

type StashEntry = TaskEntry & {
  target: Id<AnyStoreStructure> | null
}

export class Stash extends Task<StashEntry> {
  public type = 'stash'
  public target: null | AnyStoreStructure
  public emoji = '🚚'

  public load(memory: StashEntry): void {
    super.load(memory)
    this.target = memory.target ? Game.getObjectById(memory.target) : null
  }
  public save(): StashEntry {
    const memory = super.save()
    memory.target = this.target?.id || null
    return memory
  }
  public getIsFinished(): boolean {
    const creep = this.creep
    const target = this.target
    if (!creep || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
      return true
    if (
      !target ||
      (target.store as GenericStore).getFreeCapacity(RESOURCE_ENERGY) === 0
    )
      return true
    return false
  }

  public update(): void {
    this.target = this.target ? Game.getObjectById(this.target.id) : null
    super.update()
  }

  public run(): void {
    if (!this.target) return

    const result = this.transfer(this.target)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.target.pos)
  }
}

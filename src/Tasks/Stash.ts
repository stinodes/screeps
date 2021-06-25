import { Task, TaskEntry } from './Task'

type StashEntry = TaskEntry & {
  target: string
}

export class Stash extends Task<StashEntry> {
  public type = 'stash'
  public target: null | AnyStoreStructure

  public load(memory: StashEntry): void {
    super.load(memory)
    this.target = Game.getObjectById(memory.target)
  }
  public save(): StashEntry {
    const memory = super.save()
    memory.target = this.target?.id || ''
    return memory
  }
  public getIsFinished(): boolean {
    const creep = this.creep
    const target = this.target
    if (!creep || creep.store.getUsedCapacity() === 0) return true
    if (!target || (target.store as Store<RESOURCE_ENERGY, false>).getFreeCapacity() === 0) return true
    return false
  }

  public run(): void {
    if (!this.target) return

    const result = this.transfer(this.target)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.target.pos)
  }
}

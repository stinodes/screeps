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
    if (!creep) return false
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
  }

  public run(): void {
    if (!this.target) return

    const result = this.transfer(this.target)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.target.pos)
  }
}

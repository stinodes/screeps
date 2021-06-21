import { Task, TaskEntry } from './Task'

type LoadEntry = TaskEntry & {
  store: string
}

export class Load extends Task<LoadEntry> {
  public type = 'load'
  public store: null | AnyStoreStructure

  public load(memory: LoadEntry): void {
    super.load(memory)
    this.store = Game.getObjectById(memory.store)
  }
  public save(): LoadEntry {
    const memory = super.save()
    memory.store = this.store?.id || ''
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    if (!creep) return false
    return creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
  }

  public run(): void {
    if (!this.store) return

    const result = this.withdraw(this.store)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.store.pos)
  }
}

import { Task, TaskEntry } from './Task'

type CollectEntry = TaskEntry & { resource: Id<Resource> | null }
export class Collect extends Task<CollectEntry> {
  public type: 'collect' = 'collect'
  public resource: Resource | null
  public emoji = '🛒'

  public load(memory: CollectEntry): void {
    super.load(memory)
    this.resource = memory.resource ? Game.getObjectById(memory.resource) : null
  }
  public save(): CollectEntry {
    const memory = super.save()
    memory.resource = this.resource?.id || null
    return memory
  }

  public getIsFinished(): boolean {
    if (!this.resource) return true
    if (this.resource.amount === 0) return true

    return this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
  }

  public run(): void {
    if (this.creep.spawning || !this.resource) return

    const result = this.pickup(this.resource)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.resource.pos)
  }
}

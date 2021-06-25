import { Task, TaskEntry } from './Task'

type UpgradeEntry = TaskEntry & { room: string }
export class Upgrade extends Task<UpgradeEntry> {
  public type = 'upgrade'
  public room: Room
  public emoji = '🔺'

  public load(memory: UpgradeEntry): void {
    super.load(memory)
    this.room = Game.rooms[memory.room]
  }
  public save(): UpgradeEntry {
    const memory = super.save()
    memory.room = this.room.name
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    if (!creep || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return true
    if (!this.room) return true
    return false
  }

  protected getPathStyle(): PolyStyle {
    const style = super.getPathStyle()
    style.stroke = '#cae028'
    return style
  }

  public run(): void {
    const controller: undefined | StructureController = this.room.controller
    if (!controller) return

    const result = this.upgrade(controller)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(controller.pos)
  }
}

import { Task, TaskEntry } from './Task'

type MoveToEntry = TaskEntry & {
  coords: [number, number] | null
}

export class MoveTo extends Task<MoveToEntry> {
  public type = 'moveto'
  public position: null | RoomPosition
  public emoji = '👟'

  public load(memory: MoveToEntry): void {
    super.load(memory)
    this.position =
      memory.coords && this.job?.room
        ? this.job.room.getPositionAt(...memory.coords)
        : null
  }
  public save(): MoveToEntry {
    const memory = super.save()
    memory.coords = this.position ? [this.position.x, this.position.y] : null
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    if (!creep || !this.position) return true
    if (creep.pos.x === this.position.x && creep.pos.y === this.position.y)
      return true
    return false
  }

  protected getPathStyle(): PolyStyle {
    const style = super.getPathStyle()
    style.stroke = '#cae028'
    return style
  }

  public run(): void {
    if (!this.position) return

    this.moveToTarget(this.position)
  }
}

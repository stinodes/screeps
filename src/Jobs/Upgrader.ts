import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Upgrade } from '../Tasks/Upgrade'
import { Harvest } from '../Tasks/Harvest'
import { Collect } from '../Tasks/Collect'
import { Body } from './Body'

type UpgraderEntry = JobEntry & { room: string }
export class Upgrader extends Job<
  UpgraderEntry,
  Upgrade | Load | Harvest | Collect
> {
  public type: 'upgrader' = 'upgrader'
  public room: Room
  public step: 'upgrade' | 'load' = 'load'

  public body = Body.create()
    .addDynamicPart(WORK, 1 / 4)
    .addDynamicPart(MOVE, 1 / 4)
    .addDynamicPart(CARRY, 2 / 4)

  public load(memory: UpgraderEntry): void {
    super.load(memory)
    this.room = Game.rooms[memory.room]
  }
  public save(): UpgraderEntry {
    const memory = super.save()
    memory.room = this.room.name
    return memory
  }

  protected getNextTask(): Upgrade | Load | Harvest | Collect {
    if (this.step === 'upgrade') return this.getUpgradeTask()
    return this.getFetchResourceTask()
  }
  protected onTaskFinish(): void {
    if (this.getFreeCapacity() === 0) this.step = 'upgrade'
    if (this.getUsedCapacity() === 0) this.step = 'load'
  }

  public update(): void {
    if (this.spawning) return
    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}

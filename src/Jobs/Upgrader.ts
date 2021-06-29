import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Upgrade } from '../Tasks/Upgrade'
import { Harvest } from '../Tasks/Harvest'
import { LoadTarget } from '../Target/LoadTarget'

type UpgraderEntry = JobEntry & { room: string }
export class Upgrader extends Job<UpgraderEntry, Upgrade | Load | Harvest> {
  public type: 'upgrader' = 'upgrader'
  public room: Room
  public body = [WORK, MOVE, MOVE, CARRY, CARRY]

  public load(memory: UpgraderEntry): void {
    super.load(memory)
    this.room = Game.rooms[memory.room]
  }
  public save(): UpgraderEntry {
    const memory = super.save()
    memory.room = this.room.name
    return memory
  }

  protected getNextTask(
    finishedTask?: Upgrade | Load | Harvest
  ): Upgrade | Load | Harvest {
    const type = finishedTask?.type
    switch (type) {
      case 'load':
      case 'harvest':
        if (this.creep.store.getFreeCapacity() !== 0)
          return this.getLoadOrHarvestTask()
        return this.getUpgradeTask()
      default:
        return this.getLoadOrHarvestTask()
    }
  }

  private getLoadOrHarvestTask(): Harvest | Load {
    const loadTarget = LoadTarget.fromJob(LoadTarget, this)
    if (loadTarget.exists) return this.getLoadTask(loadTarget)
    return this.getHarvestTask()
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

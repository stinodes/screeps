import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Build } from '../Tasks/Build'
import { Harvest } from '../Tasks/Harvest'
import { Upgrade } from '../Tasks/Upgrade'
import { BuildTarget } from '../Target/BuildTarget'
import { Stash } from '../Tasks/Stash'
import { Collect } from '../Tasks/Collect'
import { Repair } from '../Tasks/Repair'
import { Body } from './Body'

type BuilderEntry = JobEntry & { construction: null | Id<ConstructionSite> }
export class Builder extends Job<
  BuilderEntry,
  Build | Repair | Stash | Upgrade | Load | Harvest | Collect
> {
  public type: 'builder' = 'builder'
  public construction: null | ConstructionSite
  public step: 'build' | 'load' = 'load'

  public body = Body.create()
    .addDynamicPart(WORK, 1 / 4)
    .addDynamicPart(MOVE, 1 / 4)
    .addDynamicPart(CARRY, 2 / 4)

  public load(memory: BuilderEntry): void {
    super.load(memory)
    this.construction = memory.construction
      ? Game.getObjectById(memory.construction)
      : null
  }
  public save(): BuilderEntry {
    const memory = super.save()
    memory.construction = this.construction?.id || null
    return memory
  }

  protected getNextTask():
    | Build
    | Repair
    | Stash
    | Upgrade
    | Load
    | Harvest
    | Collect {
    if (this.step === 'build') {
      console.log('get use resource task')
      return this.getUseResourceTask(['stash'])
    }
    return this.getFetchResourceTask()
  }

  protected onTaskFinish(): void {
    if (this.getFreeCapacity() === 0) this.step = 'build'
    else if (this.getUsedCapacity() === 0) this.step = 'load'
  }

  public update(): void {
    if (this.spawning) return
    if (!this.construction) {
      const target = BuildTarget.fromJob(BuildTarget, this)
      if (target.exists) this.construction = target.target
    }
    super.update()
  }
}

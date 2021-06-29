import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Build } from '../Tasks/Build'
import { Harvest } from '../Tasks/Harvest'
import { Upgrade } from '../Tasks/Upgrade'
import { LoadTarget } from '../Target/LoadTarget'
import { BuildTarget } from '../Target/BuildTarget'
import { SourceTarget } from '../Target/SourceTarget'
import { StoreTarget } from '../Target/StoreTarget'
import { Stash } from '../Tasks/Stash'

type BuilderEntry = JobEntry & { construction: null | Id<ConstructionSite> }
export class Builder extends Job<
  BuilderEntry,
  Build | Stash | Upgrade | Load | Harvest
> {
  public type: 'builder' = 'builder'
  public construction: null | ConstructionSite
  public body = [WORK, MOVE, MOVE, CARRY, CARRY]

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

  protected getNextTask(
    finishedTask?: Build | Stash | Upgrade | Load | Harvest
  ): Build | Stash | Upgrade | Load | Harvest {
    const type = finishedTask?.type

    switch (type) {
      case 'load':
      case 'harvest': {
        if (this.creep?.store.getFreeCapacity() !== 0) {
          return this.getLoadOrHarvestTask()
        }
        return this.getUseEnergyTask()
      }
      case 'build':
      case 'upgrade':
      default: {
        if (this.creep?.store.getUsedCapacity() !== 0) {
          return this.getUseEnergyTask()
        }
        return this.getLoadOrHarvestTask()
      }
    }
  }

  private getUseEnergyTask(): Build | Stash | Upgrade {
    const buildTarget = BuildTarget.fromJob(BuildTarget, this)
    if (buildTarget.exists) {
      return this.getBuildTask(buildTarget)
    }

    const storeTarget = StoreTarget.fromJob(StoreTarget, this)
    if (storeTarget.exists) {
      return this.getStashTask(storeTarget)
    }

    return this.getUpgradeTask()
  }
  private getLoadOrHarvestTask(): Harvest | Load {
    const buildTarget = BuildTarget.fromJob(BuildTarget, this)

    if (buildTarget.exists) {
      const loadTarget = LoadTarget.fromJob(LoadTarget, this)
      if (loadTarget.exists) return this.getLoadTask(loadTarget)
    }
    return this.getHarvestTask(SourceTarget.fromJob(SourceTarget, this))
  }

  public update(): void {
    if (this.spawning) return
    if (!this.construction) {
      const target = BuildTarget.fromJob(BuildTarget, this)
      if (target.exists) this.construction = target.target
    }
    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}

import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Build } from '../Tasks/Build'
import { Collections } from '../Memory'

type BuilderEntry = JobEntry & { room: string; construction: string }
export class Builder extends Job<BuilderEntry, Build | Load> {
  public type: 'builder' = 'builder'
  public construction: null | ConstructionSite
  public room: Room
  public body = [WORK, MOVE, CARRY]

  public load(memory: BuilderEntry): void {
    super.load(memory)
    this.construction = Game.getObjectById(memory.construction)
    this.room = Game.rooms[memory.room]
  }
  public save(): BuilderEntry {
    const memory = super.save()
    memory.construction = this.construction?.id || ''
    memory.room = this.room.name
    return memory
  }

  protected getNextTask(finishedTask?: Build | Load): Build | Load {
    if (finishedTask?.type === 'build') {
      return this.getLoadTask()
    } else {
      return this.getBuildTask()
    }
  }

  private getLoadTask(): Load {
    const load = Collections.tasks.create('load', Load.ID()) as Load
    const store = this.getLoadTarget()
    load.store = store
    load.job = this
    return load
  }
  private getBuildTask(): Build {
    const build = Collections.tasks.create('build', Build.ID()) as Build
    build.construction = this.construction
    build.job = this
    return build
  }

  private getBuildTarget(): null | ConstructionSite {
    const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES)
    return constructionSites[0] || null
  }

  private getLoadTarget(): null | AnyStoreStructure {
    const storages = this.room
      .find(FIND_STRUCTURES)
      .filter(s => s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER)
    if (storages.length) return storages[0] as AnyStoreStructure
    const extensions = this.room
      .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
      .filter(ext => ext.structureType === STRUCTURE_EXTENSION && ext.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    if (extensions.length) return extensions[0] as AnyStoreStructure
    const spawns = this.room.find(FIND_MY_SPAWNS)
    if (spawns.length) return spawns[0]
    return null
  }

  public update(): void {
    if (this.spawning) return
    if (!this.construction) this.construction = this.getBuildTarget()
    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}

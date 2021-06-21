import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Build } from '../Tasks/Build'

type BuilderEntry = JobEntry & { room: string; construction: string }
export class Builder extends Job<BuilderEntry, Build | Load> {
  public type = 'builder'
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

  protected getNextTask(finishedTask: Build | Load): Build | Load {
    if (finishedTask.type === 'build') {
      return this.getLoadTask()
    } else {
      return this.getBuildTask()
    }
  }

  private getLoadTask(): Load {
    const load = new Load(Load.ID())
    const store = this.getLoadTarget()
    load.load({
      id: load.id,
      type: load.type,
      store: store?.id || '',
      job: this.id,
      finished: false
    })
    return load
  }
  private getBuildTask(): Build {
    const construction = this.construction
    const build = new Build(Build.ID())
    build.load({
      id: build.id,
      type: build.type,
      construction: construction?.id || '',
      job: this.id,
      finished: false
    })
    return build
  }

  private getBuildTarget(): null | ConstructionSite {
    const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES)
    return constructionSites[0] || null
  }

  private getLoadTarget(): null | AnyOwnedStructure {
    const storages = this.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } })
    if (storages.length) return storages[0]
    const extensions = this.room
      .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
      .filter(ext => ext.structureType === STRUCTURE_EXTENSION && ext.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    if (extensions.length) return extensions[0]
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

import { Behavior } from '../Behavior'
import { Collections } from '../Memory/index'
import { Entry } from '../Memory/Collection'
import { State } from '../State'
import { Task } from '../Tasks/Task'
import { Mission, MissionEntry } from '../Missions/Mission'
import { Harvest } from '../Tasks/Harvest'
import { SourceTarget } from '../Target/SourceTarget'
import { StoreTarget } from '../Target/StoreTarget'
import { Stash } from '../Tasks/Stash'
import { BuildTarget } from '../Target/BuildTarget'
import { Build } from '../Tasks/Build'
import { Upgrade } from '../Tasks/Upgrade'
import { ResourceTarget } from '../Target/ResourceTarget'
import { Collect } from '../Tasks/Collect'
import { LoadTarget } from '../Target/LoadTarget'
import { Load } from '../Tasks/Load'

export type JobUpgradeTarget = {
  type: string
  prop: string
}
export type JobEntry = Entry & {
  currentTask: string
  previousTask: string
  creepName: string
  mission: string
  room: string
}
export abstract class Job<S extends JobEntry, T extends Task<any> = Task<any>>
  extends State<S>
  implements Behavior
{
  protected currentTask: null | T
  public creepName: string
  public room: Room
  public mission: Mission<MissionEntry, any>
  public body: BodyPartConstant[]
  public upgrades: JobUpgradeTarget | null = null

  /**
   * Optional members
   */
  public source?: Source | null

  public static ID = (): string => Collections.jobs.ID()

  /**
   * Memory management
   */
  public load(memory: S): void {
    super.load(memory)
    this.currentTask = Collections.tasks.load(memory.currentTask) as T
    this.mission = Collections.missions.load(memory.mission) as Mission<
      MissionEntry,
      any
    >
    this.creepName = memory.creepName
    this.room = Game.rooms[memory.room]
  }
  public save(): S {
    const memory = super.save()
    if (this.currentTask) memory.currentTask = this.currentTask.id
    memory.creepName = this.creepName
    memory.mission = this.mission.id
    memory.room = this.room.name
    return memory
  }

  /**
   * Easy data proxies
   */
  public get delete(): boolean {
    return !this.creep
  }

  public get spawning(): boolean {
    return !this.creep || this.creep.spawning
  }

  public get creep(): Creep {
    return Game.creeps[this.creepName]
  }

  /**
   * Overloadable API
   */
  protected getNextTask(finishedTask?: null | T): T | null {
    return finishedTask || null
  }

  /**
   * Task initialization
   */

  protected getHarvestTask(target?: SourceTarget): Harvest {
    const harvest = Collections.tasks.create(
      'harvest',
      Collections.tasks.ID()
    ) as Harvest
    if ('source' in this && this.source) harvest.source = this.source
    else if (target) harvest.source = target.target
    else harvest.source = null
    harvest.job = this
    return harvest
  }
  protected getCollectTask(target: ResourceTarget): Collect {
    const collect = Collections.tasks.create(
      'collect',
      Collections.tasks.ID()
    ) as Collect
    collect.job = this
    collect.resource = target.target
    return collect
  }
  protected getLoadTask(target: LoadTarget): Load {
    const load = Collections.tasks.create('load', Load.ID()) as Load
    load.storage = target.target
    load.job = this
    return load
  }

  protected getStashTask(target: StoreTarget): Stash {
    const stash = Collections.tasks.create(
      'stash',
      Collections.tasks.ID()
    ) as Stash
    stash.target = target.target
    stash.job = this
    return stash
  }
  protected getBuildTask(target: BuildTarget): Build {
    const build = Collections.tasks.create('build', Build.ID()) as Build
    build.construction = target.target
    build.job = this
    return build
  }
  protected getUpgradeTask(): Upgrade {
    const upgrade = Collections.tasks.create('upgrade', Upgrade.ID()) as Upgrade
    upgrade.room = this.room
    upgrade.job = this
    return upgrade
  }

  public update(): void {
    if (this.spawning) return

    if (!this.currentTask) {
      this.currentTask = this.getNextTask()
    }
    if (this.currentTask && this.currentTask.finished)
      this.currentTask = this.getNextTask(this.currentTask)

    if (this.currentTask) this.currentTask.update()
  }
  public run(): void {
    if (this.spawning) return

    if (this.currentTask) this.currentTask.run()
    this.creep.say(
      `${this.type.slice(0, 4)}: ${this.currentTask?.emoji || '💤'}`
    )
  }
}

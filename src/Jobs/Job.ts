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
import { RepairTarget } from '../Target/RepairTarget'
import { Repair } from '../Tasks/Repair'
import { TransferTarget } from '../Target/TransferTarget'
import { Transfer } from '../Tasks/Transfer'
import { MoveTo } from '../Tasks/MoveTo'
import { Body } from './Body'

export type JobUpgradeTarget = {
  type: string
  prop: string
}
export type JobEntry = Entry & {
  currentTask: string
  previousTask: string
  creepName: string
  step: string
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
  public upgrades: JobUpgradeTarget | null = null
  public step: string
  public transferable = true
  public transferring = false

  public body: Body

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
    this.step = memory.step
    this.room = Game.rooms[memory.room]
  }
  public save(): S {
    const memory = super.save()
    if (this.currentTask) memory.currentTask = this.currentTask.id
    memory.creepName = this.creepName
    memory.mission = this.mission.id
    memory.room = this.room.name
    memory.step = this.step
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

  public getFreeCapacity(resource: ResourceConstant = RESOURCE_ENERGY): number {
    if (!this.creep) return 0
    return this.creep.store.getFreeCapacity(resource)
  }
  public getUsedCapacity(resource: ResourceConstant = RESOURCE_ENERGY): number {
    if (!this.creep) return 0
    return this.creep.store.getUsedCapacity(resource)
  }

  /**
   * Overloadable API
   */
  protected getNextTask(finishedTask?: null | T): T | null {
    return finishedTask || null
  }
  protected onTaskFinish(finishedTask?: null | T): void {
    return
  }

  /**
   * Task initialization
   */
  // Misc
  protected getMoveToTask(position: RoomPosition): MoveTo {
    const moveTo = Collections.tasks.create(
      'moveto',
      Collections.tasks.ID()
    ) as MoveTo
    moveTo.position = position
    moveTo.job = this
    return moveTo
  }
  // Fetching resources
  protected getFetchResourceTask(
    blackList: string[] = []
  ): Harvest | Collect | Load {
    const loadTarget = LoadTarget.fromJob(LoadTarget, this)
    if (loadTarget.exists && !blackList.includes('load')) {
      return this.getLoadTask(loadTarget)
    }
    const resourceTarget = ResourceTarget.fromJob(ResourceTarget, this)
    if (resourceTarget.exists && !blackList.includes('collect')) {
      return this.getCollectTask(resourceTarget)
    }
    return this.getHarvestTask()
  }
  protected getHarvestTask(target?: SourceTarget): Harvest {
    const harvest = Collections.tasks.create(
      'harvest',
      Collections.tasks.ID()
    ) as Harvest
    if (target) harvest.source = target.target
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

  // Using resources
  protected getUseResourceTask(
    blackList: string[] = []
  ): Stash | Repair | Build | Upgrade {
    const stashTarget = StoreTarget.fromJob(StoreTarget, this)
    if (stashTarget.exists && !blackList.includes('stash')) {
      return this.getStashTask(stashTarget)
    }
    const repairTarget = RepairTarget.fromJob(RepairTarget, this)
    if (repairTarget.exists && !blackList.includes('repair')) {
      return this.getRepairTask(repairTarget)
    }
    const buildTarget = BuildTarget.fromJob(BuildTarget, this)
    if (buildTarget.exists && !blackList.includes('build')) {
      return this.getBuildTask(buildTarget)
    }
    return this.getUpgradeTask()
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
  protected getTransferTask(target: TransferTarget): Transfer {
    const transfer = Collections.tasks.create(
      'transfer',
      Collections.tasks.ID()
    ) as Transfer
    transfer.target = target.target
    transfer.job = this
    return transfer
  }
  protected getRepairTask(target: RepairTarget): Repair {
    const repair = Collections.tasks.create('repair', Build.ID()) as Repair
    repair.building = target.target
    repair.job = this
    return repair
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

  private say(): void {
    if (Memory?.config?.hideSay) return
    this.creep.say(
      `${this.type.slice(0, 4)}: ${this.currentTask?.emoji || '💤'}`
    )
  }

  public update(): void {
    if (this.spawning) return

    if (!this.currentTask) {
      this.currentTask = this.getNextTask()
    }
    if (this.currentTask && this.currentTask.finished) {
      this.onTaskFinish(this.currentTask)
      this.currentTask = this.getNextTask(this.currentTask)
    }

    if (this.currentTask) this.currentTask.update()
  }
  public run(): void {
    if (this.spawning) return

    if (this.currentTask) this.currentTask.run()

    this.say()
  }
}

import { Behavior } from '../Behavior'
import { Collections } from '../Memory'
import { Entry } from '../Memory/Collection'
import { Job } from '../Jobs/Job'
import { State } from '../State'

export type TaskEntry = Entry & {
  job: string
  finished: boolean
}
type Upgrades = null | {
  type: string
  prop: string
}

export abstract class Task<S extends TaskEntry>
  extends State<S>
  implements Behavior
{
  public type = 'task'
  public job: Job<any>
  public finished: boolean
  public emoji = '💤'
  public upgrades: Upgrades = null

  public static ID = (): string => Collections.tasks.ID()

  /**
   * Extensions & overrides
   */
  public load(memory: S): void {
    super.load(memory)
    this.job = Collections.jobs.load(memory.job) as Job<any>
    this.finished = memory.finished
  }
  public save(): S {
    const memory = super.save()
    memory.job = this.job.id
    memory.finished = this.getIsFinished()
    return memory
  }

  public get delete(): boolean {
    return !this.job || this.job.delete || this.finished
  }

  public getIsFinished(): boolean {
    return false
  }

  /**
   * Extra creep controlling methods
   */
  protected getPathStyle(): PolyStyle {
    return {
      stroke: '#fff',
      lineStyle: 'dashed',
      strokeWidth: 0.1,
      opacity: 0.1
    }
  }
  public get creep(): Creep {
    return Game.creeps[this.job.creepName]
  }
  public moveToTarget(pos: RoomPosition): ScreepsReturnCode {
    return this.creep?.moveTo(pos.x, pos.y, {
      visualizePathStyle: this.getPathStyle()
    })
  }
  public harvest(target: Source | Mineral): ScreepsReturnCode {
    return this.creep?.harvest(target)
  }
  public drop(): ScreepsReturnCode {
    return this.creep?.drop(RESOURCE_ENERGY)
  }
  public pickup(resource: Resource): ScreepsReturnCode {
    return this.creep?.pickup(resource)
  }
  public transfer(
    target: Creep | PowerCreep | Structure,
    resource = RESOURCE_ENERGY
  ): ScreepsReturnCode {
    return this.creep?.transfer(target, resource)
  }
  public build(target: ConstructionSite): ScreepsReturnCode {
    return this.creep?.build(target)
  }
  public upgrade(target: StructureController): ScreepsReturnCode {
    return this.creep?.upgradeController(target)
  }
  public withdraw(
    target: AnyStoreStructure,
    resource = RESOURCE_ENERGY
  ): ScreepsReturnCode {
    return this.creep?.withdraw(target, resource)
  }

  /**
   * Implementation
   */
  public update(): void {
    const isFinished = this.getIsFinished()
    this.finished = isFinished
  }
  public run(): void {
    return
  }
}

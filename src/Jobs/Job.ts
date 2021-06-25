import { Behavior } from '../Behavior'
import { Collections } from '../Memory/index'
import { Entry } from '../Memory/Collection'
import { State } from '../State'
import { Task } from '../Tasks/Task'
import { Mission, MissionEntry } from '../Missions/Mission'

export type JobEntry = Entry & {
  currentTask: string
  previousTask: string
  creepName: string
  mission: string
  room: string
}
export abstract class Job<S extends JobEntry, T extends Task<any> = Task<any>> extends State<S> implements Behavior {
  protected currentTask: null | T
  public creepName: string
  public room: Room
  public mission: Mission<MissionEntry, any>
  public body: BodyPartConstant[]

  public static ID = (): string => Collections.jobs.ID()

  public load(memory: S): void {
    super.load(memory)
    this.currentTask = Collections.tasks.load(memory.currentTask) as T
    this.mission = Collections.missions.load(memory.mission) as Mission<MissionEntry, any>
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

  public get delete(): boolean {
    return !this.creep
  }

  public get spawning(): boolean {
    return !this.creep || this.creep.spawning
  }

  public get creep(): Creep {
    return Game.creeps[this.creepName]
  }

  protected getNextTask(finishedTask?: null | T): T | null {
    return finishedTask || null
  }

  public update(): void {
    if (!this.currentTask) {
      this.currentTask = this.getNextTask()
    }
    if (this.currentTask && this.currentTask.finished) this.currentTask = this.getNextTask(this.currentTask)

    if (this.currentTask) this.currentTask.update()
  }
  public run(): void {
    if (this.currentTask) this.currentTask.run()
    this.creep.say(`${this.type.slice(0, 4)}: ${this.currentTask?.emoji || '💤'}`)
  }
}

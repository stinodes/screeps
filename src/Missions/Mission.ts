import { Job, JobEntry } from '../Jobs/Job'
import { Behavior } from '../Behavior'
import { Entry } from '../Memory/Collection'
import { State } from '../State'
import { Collections } from '../Memory'
import { Village, VillageEntry } from '../Village'

export type MissionEntry = Entry & {
  jobs: string[]
  finished: boolean
  village: string
}
export abstract class Mission<S extends MissionEntry, J extends Job<JobEntry>> extends State<S> implements Behavior {
  public type = 'mission'
  public jobs: J[]
  public finished: boolean
  public priority: number
  public village: Village<VillageEntry>

  public static ID = (): string => Collections.missions.ID()

  public save(): S {
    const memory = super.save()
    memory.finished = this.finished
    memory.jobs = this.jobs.map(job => job.id)
    memory.village = this.village.id
    return memory
  }

  public load(memory: S): void {
    super.load(memory)
    this.jobs = memory.jobs.map(id => Collections.jobs.load(id) as J).filter(Boolean)
    this.finished = memory.finished
    this.village = Collections.villages.load(memory.village) as Village<VillageEntry>
  }

  public assignVillager(job: J): void {
    job.mission = this
    this.jobs = [...this.jobs, job]
  }
  public removeUnits(...jobIds: string[]): void {
    this.jobs = this.jobs.filter(u => jobIds.indexOf(u.id) !== -1)
  }
  protected getRequiredJobs(): string[] {
    return []
  }

  public requestJob(): null | string {
    const currentJobStrings = this.jobs.map(j => j.type)
    const requiredJobStrings = this.getRequiredJobs()

    const job = requiredJobStrings.find(requiredJob => {
      const index = currentJobStrings.findIndex(foundJob => requiredJob === foundJob)
      if (index === -1) return true
      currentJobStrings.splice(index, 1)
      return false
    })

    return job || null
  }

  protected getFinished(): boolean {
    return false
  }

  public update(): void {
    this.finished = this.getFinished()
    this.jobs.forEach(job => job.update())
  }
  public run(): void {
    return this.jobs.forEach(job => job.run())
  }
}

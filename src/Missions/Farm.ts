import { MissionEntry, Mission } from './Mission'
import { Peasant } from '../Jobs/Peasant'

type SupplyEntry = MissionEntry
type Jobs = Peasant

export class Farm extends Mission<SupplyEntry, Jobs> {
  public type = 'farm'

  protected getRequiredJobs(): { peasant: number } {
    const sources = this.village.room.find(FIND_SOURCES_ACTIVE)
    return { peasant: sources.length }
  }

  public assignVillager(job: Jobs): void {
    if (job.type === 'peasant') {
      const sources = this.village.sources
      const source = sources.find(s => !this.jobs.some(j => j.source && j.source.id === s.id))
      job.source = source || null
    }
    return super.assignVillager(job)
  }
}

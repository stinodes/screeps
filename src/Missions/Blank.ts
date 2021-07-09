import { MissionEntry, Mission } from './Mission'
import { Job, JobEntry } from '../Jobs/Job'

type SettleEntry = MissionEntry
type Jobs = Job<JobEntry>

export class Blank extends Mission<SettleEntry, Jobs> {
  public type = 'blank'

  public getRequiredJobs(): string[] {
    const jobs = this.village.villagers
    const hasCouriers = jobs.some(job => job.type === 'courier')
    const hasPeasants = jobs.some(job => job.type === 'peasant')
    console.log(
      'jobs: ',
      jobs.length,
      ' | [',
      ...jobs.map(job => job.type),
      ']'
    )
    console.log(
      'blank: has couriers ',
      hasCouriers,
      ' - has peasants ',
      hasPeasants
    )
    if (!hasCouriers || !hasPeasants) return ['settler', 'settler']
    return []
  }
}

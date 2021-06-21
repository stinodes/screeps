import { MissionEntry, Mission } from './Mission'
import { Upgrader } from '../Jobs/Upgrader'

type Jobs = Upgrader

export class UpgradeRoom extends Mission<MissionEntry, Jobs> {
  public type = 'upgrade-room'

  protected getRequiredJobs(): { upgrader: number } {
    return { upgrader: 2 }
  }

  public assignVillager(job: Jobs): void {
    return super.assignVillager(job)
  }
}

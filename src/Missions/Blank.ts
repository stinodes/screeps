import { MissionEntry, Mission } from './Mission'
import { Job, JobEntry } from '../Jobs/Job'

type SettleEntry = MissionEntry
type Jobs = Job<JobEntry>

export class Blank extends Mission<SettleEntry, Jobs> {
  public type = 'blank'
}

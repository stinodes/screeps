import { Collection } from './Collection'
import { Mission, MissionEntry } from '../Missions/Mission'
import { Maintain } from '../Missions/Maintain'
import { Settle } from '../Missions/Settle'
import { Blank } from '../Missions/Blank'

type T = Mission<MissionEntry, any>

export class MissionCollection extends Collection<T> {
  public segment = 'missions'
  public getClass(type: string): new (id: string) => T {
    switch (type) {
      case 'maintain':
        return Maintain
      case 'settle':
        return Settle
      case 'blank':
        return Blank
      default:
        throw new Error('Not a matching mission')
    }
  }
}

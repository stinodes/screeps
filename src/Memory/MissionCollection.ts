import { Collection } from './Collection'
import { Mission, MissionEntry } from '../Missions/Mission'
import { Maintain } from '../Missions/Maintain'

type T = Mission<MissionEntry, any>

export class MissionCollection extends Collection<T> {
  public segment = 'missions'
  public getClass(type: string): new (id: string) => T {
    switch (type) {
      case 'maintain':
        return Maintain
      default:
        throw new Error('Not a matching mission')
    }
  }
}

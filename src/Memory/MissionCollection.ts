import { Collection } from './Collection'
import { Mission, MissionEntry } from '../Missions/Mission'
import { Farm } from '../Missions/Farm'
import { UpgradeRoom } from '../Missions/UpgradeRoom'

type T = Mission<MissionEntry, any>

export class MissionCollection extends Collection<T> {
  public segment = 'missions'
  public getClass(type: string): new (id: string) => T {
    switch (type) {
      case 'farm':
        return Farm
      case 'upgrade-room':
        return UpgradeRoom
      default:
        return Farm
    }
  }
}

import { Village, VillageEntry } from '../Village'
import { Collection } from './Collection'

export class VillageCollection extends Collection<Village<VillageEntry>> {
  public segment = 'villages'
  public getClass(type: string): new (id: string) => Village<VillageEntry> {
    switch (type) {
      default:
        return Village
    }
  }
}

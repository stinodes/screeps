import { Target } from './Target'

export class BuildTarget extends Target<ConstructionSite> {
  protected calculateTarget(): null | ConstructionSite {
    return this.village.room.find(FIND_MY_CONSTRUCTION_SITES)[0] || null
  }
}

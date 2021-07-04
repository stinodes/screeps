import { Target } from './Target'

export class RepairTarget extends Target<Structure> {
  protected calculateTarget(): Structure | null {
    const damagedBuildings = this.village.room.find(FIND_STRUCTURES, {
      filter: structure => {
        if (
          (structure.structureType === STRUCTURE_WALL ||
            structure.structureType === STRUCTURE_RAMPART) &&
          structure.hits > 4000
        )
          return false
        if (structure.hits < structure.hitsMax * 0.8) {
          return true
        }
        return false
      }
    })
    return damagedBuildings[0] || null
  }
}

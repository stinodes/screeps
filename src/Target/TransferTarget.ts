import { Target } from './Target'

export class TransferTarget extends Target<AnyStoreStructure> {
  protected calculateTarget(): null | AnyStoreStructure {
    const targets = this.village.room.find(FIND_STRUCTURES, {
      filter: struct =>
        struct.structureType === STRUCTURE_TOWER &&
        struct.store.getFreeCapacity(RESOURCE_ENERGY) > 100
    }) as AnyStoreStructure[]

    return targets[0] || null
  }
}

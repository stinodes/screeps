import { Target } from './Target'

export class StoreTarget extends Target<AnyStoreStructure> {
  protected calculateTarget(): null | AnyStoreStructure {
    if (this.creep) {
      const building = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure: AnyStoreStructure) => {
          const isExtOrSpawn: boolean =
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_EXTENSION
          const hasSpace =
            structure.store &&
            (structure.store as Store<RESOURCE_ENERGY, false>).getFreeCapacity(
              RESOURCE_ENERGY
            ) > 0
          return isExtOrSpawn && hasSpace
        }
      }) as AnyStoreStructure
      if (building) return building

      const storage = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE }
      }) as AnyStoreStructure
      if (storage) return storage
    }

    // Spawns first
    const spawns = this.village.spawns.filter(
      spawn => !!spawn.store.getFreeCapacity(RESOURCE_ENERGY)
    )
    if (spawns.length) return spawns[0]

    // Extensions if spawns full
    const extensions = this.village.room
      .find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
      })
      .filter(
        ext =>
          ext.structureType === STRUCTURE_EXTENSION &&
          !!ext.store.getFreeCapacity(RESOURCE_ENERGY)
      ) as StructureExtension[]
    if (extensions.length) return extensions[0]

    // Storages last prio
    const storages = this.village.room
      .find(FIND_STRUCTURES)
      .filter(
        s =>
          (s.structureType === STRUCTURE_STORAGE ||
            s.structureType === STRUCTURE_CONTAINER) &&
          !!s.store.getFreeCapacity(RESOURCE_ENERGY)
      ) as StructureStorage[]
    if (storages.length) return storages[0]

    return null
  }
}

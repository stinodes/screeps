import { Target } from './Target'

export class LoadTarget<
  T extends AnyStoreStructure = AnyStoreStructure
> extends Target<T> {
  protected calculateTarget(): null | T {
    // Storages first
    const storages = this.village.room
      .find(FIND_STRUCTURES)
      .filter(
        s =>
          s.structureType === STRUCTURE_STORAGE &&
          s.store.getUsedCapacity() !== 0
      ) as StructureStorage[]
    if (storages.length) return storages[0] as T

    if (this.village.hasJobRequests()) return null

    // Extensions if no storages & no spawning
    const extensions = this.village.room
      .find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
      })
      .filter(
        ext =>
          ext.structureType === STRUCTURE_EXTENSION &&
          ext.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      ) as StructureExtension[]
    if (extensions.length) return extensions[0] as T // Spawn if no storages & no spawning & no extensions

    const spawns = this.village.spawns.filter(
      spawn => spawn.store.getUsedCapacity(RESOURCE_ENERGY) >= 50
    )
    if (spawns.length) return spawns[0] as T

    return null
  }
}

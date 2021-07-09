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

    return null
  }
}

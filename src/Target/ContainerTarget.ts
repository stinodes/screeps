import { LoadTarget } from './LoadTarget'

export class ContainerTarget extends LoadTarget<StructureContainer> {
  protected calculateTarget(): StructureContainer | null {
    const containers = this.village.room
      .find(FIND_STRUCTURES)
      .filter(structure => {
        return (
          structure.structureType === STRUCTURE_CONTAINER &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 20
        )
      }) as StructureContainer[]

    return containers[0] || null
  }
}

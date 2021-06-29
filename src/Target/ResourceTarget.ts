import { Target } from './Target'

export class ResourceTarget extends Target<Resource> {
  protected calculateTarget(): null | Resource {
    if (this.creep) {
      const resource = this.creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
      if (resource) return resource
    }

    return this.village.room.find(FIND_DROPPED_RESOURCES)[0] || null
  }
}

import { Target } from './Target'

export class ResourceTarget extends Target<Resource> {
  protected calculateTarget(): null | Resource {
    // if (this.creep) {
    //   const resource = this.creep.pos.findClosestByPath(
    //     FIND_DROPPED_RESOURCES,
    //     { filter: r => r.amount >= 50 }
    //   )
    //   if (resource) return resource
    // }

    return (
      this.village.room
        .find(FIND_DROPPED_RESOURCES, {
          filter: r => r.amount >= 50
        })
        .sort((r1, r2) => r1.amount - r2.amount)[0] || null
    )
  }
}

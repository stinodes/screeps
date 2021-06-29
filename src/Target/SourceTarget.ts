import { Target } from './Target'

export class SourceTarget extends Target<Source> {
  protected calculateTarget(): Source {
    if (this.creep) {
      const source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
      if (source) return source
    }

    return this.village.sources[0] || null
  }
}

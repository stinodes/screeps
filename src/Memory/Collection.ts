import { State } from '../State'
import uuid from 'uuid-js'

export type Entry = {
  type: string
  id: string
}
export abstract class Collection<T extends State<Entry>> {
  public segment: string
  private instances: { [id: string]: T } = {}

  public ID(): string {
    const str = uuid.create().toString()
    if (this.getSegment()[str]) return this.ID()
    return str
  }

  public getSegment(): { [id: string]: Entry } {
    if (!Memory[this.segment]) Memory[this.segment] = {}
    return Memory[this.segment]
  }

  public create(type: string, id?: string): T {
    const C = this.getClass(type)
    const instance = new C(id || '')
    if (id) {
      this.instances[id] = instance
    }
    return instance
  }
  public load(id: string): T | null {
    if (this.instances[id]) return this.instances[id]

    const data = this.getSegment()[id]

    if (!data) return null

    const C = this.getClass(data.type)
    const instance = new C(id)

    this.instances[id] = instance

    instance.load(data)

    return instance
  }
  public loadAll(): T[] {
    const segment = this.getSegment()

    return Object.keys(segment)
      .map(id => this.load(id))
      .filter(Boolean) as T[]
  }

  public save(obj: T): void {
    const memory = obj.save()
    // console.log('saving', obj.type, obj.id)
    this.getSegment()[obj.id] = memory
  }
  public delete(obj: T): void {
    console.log('deleting', obj.type, obj.id)
    delete this.getSegment()[obj.id]
    delete this.instances[obj.id]
  }

  public saveAll(): void {
    Object.values(this.instances).forEach(instance => {
      if (instance.delete) this.delete(instance)
      else this.save(instance)
    })
  }

  public reset(): void {
    this.instances = {}
  }

  public getClass(id: string): new (id: string) => T {
    throw Error('Cannot call abstract collection with ' + id)
  }
}

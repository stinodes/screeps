import { Entry } from './Memory/Collection'
import uuid from 'uuid-js'

export class State<S extends Entry> {
  public type: string
  public id: string

  public static ID(): string {
    console.warn(
      'Using "State"-base ID function. Cannot guarantee duplicate-free IDs.'
    )
    return uuid.create().toString()
  }
  public constructor(id: string) {
    this.id = id
  }

  public get delete(): boolean {
    return false
  }
  public load(memory: S): void {
    this.type = memory.type
    this.id = memory.id
  }
  public save(): S {
    return { type: this.type, id: this.id } as S
  }
}

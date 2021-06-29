import { Village, VillageEntry } from '../Village'
import { JobEntry, Job } from '../Jobs/Job'

type AnyVillage = Village<VillageEntry>

export class Target<T> {
  public village: AnyVillage
  public creep: Creep | null
  private t: undefined | null | T

  public constructor(village: AnyVillage) {
    this.village = village
  }

  public static fromVillage<T extends Target<any>>(
    TClass: new (v: AnyVillage) => T,
    village: AnyVillage
  ): T {
    const t = new TClass(village)
    return t
  }

  public static fromJob<T extends Target<any>>(
    TClass: new (v: AnyVillage) => T,
    job: Job<JobEntry>
  ): T {
    const t = new TClass(job.mission.village)
    t.creep = job.creep
    return t
  }

  public get exists(): boolean {
    return !!this.target
  }

  public get target(): null | T {
    if (this.t === undefined) {
      this.setTarget()
    }
    return this.t || null
  }

  protected calculateTarget(): null | T {
    throw new Error('Base class, cannot target anything')
  }
  private setTarget(): void {
    this.t = this.calculateTarget()
  }
}

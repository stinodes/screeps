import { Peasant } from '../Jobs/Peasant'
import { MissionEntry, Mission } from './Mission'
import { Upgrader } from '../Jobs/Upgrader'
import { Builder } from '../Jobs/Builder'
import { Courier } from '../Jobs/Courier'

type MaintainEntry = MissionEntry & {
  constructionSites: Id<ConstructionSite>[]
}
type Jobs = Builder | Peasant | Upgrader | Courier

export class Maintain extends Mission<MaintainEntry, Jobs> {
  public type = 'maintain'
  public constructionSites: ConstructionSite[] = []
  public autoUpdateSites = true

  public load(memory: MaintainEntry): void {
    super.load(memory)
    this.constructionSites = memory.constructionSites
      .map(id => Game.getObjectById<ConstructionSite>(id))
      .filter(Boolean) as ConstructionSite[]
  }
  public save(): MaintainEntry {
    const memory = super.save()
    memory.constructionSites = this.constructionSites.map(site => site.id)
    return memory
  }

  /**
   * Makeup:
   * - 1 peasant per source in the room
   * - 2 upgraders
   * - 1 builder or 1 for every 4 constructions (whichever is most)
   *
   * Get at least half of peasants out before starting to add upgraders
   */
  protected getRequiredJobs(): string[] {
    const sources = this.village.room.find(FIND_SOURCES_ACTIVE)
    const nBuilders = Math.min(Math.max(this.constructionSites.length, 1), 3)

    //  need couriers to make peasants useful
    const couriers = ['courier']
    // peasant chunks
    const peasants = new Array<string>(sources.length).fill('peasant')
    const workers: (string | string[])[] = couriers.concat(peasants)
    // append builders
    workers.push('upgrader')
    workers.push('upgrader')
    workers.push(new Array(nBuilders).fill('builder'))
    const flattenedWorkers = _.flatten(workers).filter(Boolean)

    return flattenedWorkers
  }

  public assignVillager(job: Jobs): void {
    if (job.type === ('peasant' as const)) {
      const sources = this.village.sources
      const source = sources.find(
        s => !this.jobs.some(j => 'source' in j && j.source?.id === s.id)
      )
      if (source) {
        job.source = source || null
        job.flag = source.pos.findClosestByRange(FIND_FLAGS, {
          filter: flag => flag.name.indexOf('harvest') !== -1
        })
      }
    }
    if (job.type === ('builder' as const)) {
      const site = this.constructionSites[0]
      job.construction = site || null
    }
    return super.assignVillager(job)
  }

  private isConstructionFinished(construction: ConstructionSite): boolean {
    return construction.progress >= construction.progressTotal
  }

  public update(): void {
    if (this.autoUpdateSites) {
      const newSites = this.village.room
        .find(FIND_CONSTRUCTION_SITES)
        .filter(site => !this.constructionSites.some(s => site.id === s.id))
      this.constructionSites = [...this.constructionSites, ...newSites]
    }
    this.constructionSites = this.constructionSites.filter(
      c => !this.isConstructionFinished(c)
    )
    this.jobs.forEach(job => {
      if (job.type === ('builder' as const)) {
        if (
          !job.construction ||
          this.isConstructionFinished(job.construction)
        ) {
          job.construction = this.constructionSites[0]
        }
      }
    })
    super.update()
  }
}

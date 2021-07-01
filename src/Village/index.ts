import { Behavior } from '../Behavior'
import { Entry } from '../Memory/Collection'
import { State } from '../State'
import { JobEntry, Job } from '../Jobs/Job'
import { MissionEntry, Mission } from '../Missions/Mission'
import { Collections } from '../Memory'

type AnyMission = Mission<MissionEntry, any>
type AnyJob = Job<JobEntry>

type Progress = {
  [key: string]: boolean
}
export type VillageEntry = Entry & {
  name: string
  room: string
  villagers: string[]
  missions: string[]
  progress: Progress
}
export class Village<S extends VillageEntry>
  extends State<S>
  implements Behavior
{
  private roomName: string
  private triggeredSpawns: string[] = []

  public type = 'base'
  public missions: AnyMission[]
  public progress: Progress = {}
  public villagers: AnyJob[]

  public static ID = (): string => Collections.villages.ID()

  public save(): S {
    const memory = super.save()
    memory.room = this.room.name
    memory.villagers = this.villagers
      .filter(villager => !!villager.creep)
      .map(villager => villager.id)
    memory.missions = this.missions.map(mission => mission.id)
    memory.progress = this.progress || {}
    return memory
  }
  public load(memory: S): void {
    super.load(memory)
    this.roomName = memory.room
    this.villagers = memory.villagers
      .map(id => Collections.jobs.load(id) as AnyJob)
      .filter(Boolean)
    this.missions = memory.missions
      .map(id => Collections.missions.load(id) as AnyMission)
      .filter(Boolean)
    this.progress = memory.progress
  }

  public get controllerLevel(): null | number {
    return this.room.controller?.level || null
  }
  public get spawns(): StructureSpawn[] {
    return this.room.find(FIND_MY_SPAWNS)
  }
  public get room(): Room {
    return Game.rooms[this.roomName]
  }
  public get sources(): Source[] {
    return this.room.find(FIND_SOURCES_ACTIVE)
  }

  public hasJobRequests(): boolean {
    return !!this.getNextJobRequest()
  }
  private getNextJobRequest(): null | { mission: AnyMission; job: string } {
    return this.missions.reduce((prev, mission) => {
      if (prev) return prev
      const job = mission.requestJob()
      if (job) return { mission, job }
      return null
    }, null as null | { mission: AnyMission; job: string })
  }

  private dryRunSpawnJob(spawn: StructureSpawn, jobName: string): boolean {
    const id = Job.ID()
    const name = `${jobName}:${id}`
    const testJob = Collections.jobs.create(jobName)

    const dryRunResult = spawn.spawnCreep(testJob.body, name, {
      dryRun: true
    })

    return dryRunResult === 0
  }

  private destroyUpgradedJobs(newJob: AnyJob): void {
    const upgrades = newJob.upgrades
    if (!upgrades) return
    const upgradedJobs = this.villagers.filter(
      job =>
        job.type === upgrades.type &&
        (job as { [key: string]: any })[upgrades.prop] ===
          (newJob as { [key: string]: any })[upgrades.prop]
    )
    upgradedJobs.forEach(job => {
      job.creep.suicide()
    })
  }

  private spawnJob(spawn: StructureSpawn, jobName: string): void | AnyJob {
    if (this.triggeredSpawns.includes(spawn.name)) return

    const id = Job.ID()
    const name = `${jobName}:${id}`
    const job = Collections.jobs.create(jobName, id)
    job.creepName = name
    job.room = this.room
    const result = spawn.spawnCreep(job.body, name, {
      memory: { jobName, jobId: id }
    })

    if (result !== 0) {
      return console.log('Error spawning job:, ', result)
    }

    this.triggeredSpawns.push(spawn.name)
    this.villagers = [...this.villagers, job]
    return job
  }

  private getAvailableSpawn(jobName: string): StructureSpawn | null {
    return (
      this.spawns.find(
        spawn =>
          !this.triggeredSpawns.includes(spawn.name) &&
          !spawn.spawning &&
          this.dryRunSpawnJob(spawn, jobName)
      ) || null
    )
  }

  private spawnRequiredJobs(): void {
    let done = false
    while (!done) {
      const result = this.getNextJobRequest()
      console.log('requested job:', result?.job)
      if (!result) {
        done = true
        break
      }

      const spawn = this.getAvailableSpawn(result.job)
      if (!spawn) {
        done = true
        break
      }

      const job = this.spawnJob(spawn, result.job)
      if (job) {
        result.mission.assignVillager(job)
        // destroy upgraded villagers AFTER assignment
        this.destroyUpgradedJobs(job)
      }
    }
  }

  /**
   * emergency function, kind of
   */
  public manualSpawn(jobName: string): void {
    const spawn = this.getAvailableSpawn(jobName)
    if (!spawn) throw Error('No spawn that can spawn this job :(')
    const job = this.spawnJob(spawn, jobName)
    if (!job) throw Error('Something went wrong while spawning :(')
    const blank = this.findMission('blank')
    if (blank) blank.assignVillager(job)
  }

  private reassignVillagers(): void {
    const blank = this.missions.find(mission => mission.type === 'blank')
    if (!blank) return
    this.villagers.forEach(job => {
      if (!job.mission) blank.assignVillager(job)
    })
  }

  private createMission(type: string): AnyMission {
    const id = Collections.missions.ID()
    const mission = Collections.missions.create(type, id)
    mission.jobs = []
    mission.village = this
    mission.finished = false
    return mission
  }
  private assignMission(mission: AnyMission) {
    console.log('Assigning mission', mission.type)
    this.missions = [...this.missions, mission]
  }
  private findMission(type: string): void | AnyMission {
    return this.missions.find(mission => mission.type === type)
  }
  private hasMission(type: string): boolean {
    return !!this.findMission(type)
  }
  private createMissions(): void {
    if (!this.hasMission('blank'))
      this.assignMission(this.createMission('blank'))
    if (!this.hasMission('settle') && !this.progress.settle) {
      this.assignMission(this.createMission('settle'))
    }
    if (!this.hasMission('maintain') && this.progress.settle) {
      this.assignMission(this.createMission('maintain'))
    }
  }

  public update(): void {
    this.triggeredSpawns = []
    this.createMissions()
    this.reassignVillagers()
    this.spawnRequiredJobs()
    this.missions.forEach(mission => {
      mission.update()
      if (mission.finished) this.progress[mission.type] = true
    })
  }
  public run(): void {
    return this.missions.forEach(mission => mission.run())
  }
}

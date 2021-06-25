import { Behavior } from '../Behavior'
import { Entry } from '../Memory/Collection'
import { State } from '../State'
import { JobEntry, Job } from '../Jobs/Job'
import { MissionEntry, Mission } from '../Missions/Mission'
import { Collections } from '../Memory'

type MissionType = Mission<MissionEntry, any>

export type VillageEntry = Entry & {
  name: string
  room: string
  villagers: string[]
  missions: string[]
}
export class Village<S extends VillageEntry> extends State<S> implements Behavior {
  public type = 'base'
  public room: Room
  public villagers: Job<JobEntry>[]
  public missions: MissionType[]
  public spawns: StructureSpawn[]
  private triggeredSpawns: string[] = []

  public static ID = (): string => Collections.villages.ID()

  public save(): S {
    const memory = super.save()
    memory.room = this.room.name
    memory.villagers = this.villagers.filter(villager => !!villager.creep).map(villager => villager.id)
    memory.missions = this.missions.map(mission => mission.id)
    return memory
  }
  public load(memory: S): void {
    super.load(memory)
    this.room = Game.rooms[memory.room]
    this.villagers = memory.villagers.map(id => Collections.jobs.load(id) as Job<JobEntry>).filter(Boolean)
    this.missions = memory.missions.map(id => Collections.missions.load(id) as MissionType)
    this.spawns = this.room.find(FIND_MY_SPAWNS)
  }

  public get sources(): Source[] {
    return this.room.find(FIND_SOURCES_ACTIVE)
  }
  public get controllerLevel(): null | number {
    return this.room.controller?.level || null
  }

  private getNextJobRequest(): null | { mission: MissionType; job: string } {
    return this.missions.reduce((prev, mission) => {
      if (prev) return prev
      const job = mission.requestJob()
      console.log('requested job:', job)
      if (job) return { mission, job }
      return null
    }, null as null | { mission: MissionType; job: string })
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

  private spawnJob(spawn: StructureSpawn, jobName: string): void | Job<JobEntry> {
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
      return
    }

    this.triggeredSpawns.push(spawn.name)
    this.villagers = [...this.villagers, job]
    return job
  }

  private getAvailableSpawn(jobName: string): StructureSpawn | null {
    return (
      this.spawns.find(
        spawn => !this.triggeredSpawns.includes(spawn.name) && !spawn.spawning && this.dryRunSpawnJob(spawn, jobName)
      ) || null
    )
  }

  private spawnRequiredJobs(): void {
    let done = false
    while (!done) {
      const result = this.getNextJobRequest()
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
      if (job) result.mission.assignVillager(job)
    }
  }

  private createMission(type: string): MissionType {
    const id = Collections.missions.ID()
    const mission = Collections.missions.create(type, id)
    mission.jobs = []
    mission.village = this
    mission.finished = false
    return mission
  }
  private assignMission(mission: MissionType) {
    console.log('Assigning mission', mission.type)
    this.missions = [...this.missions, mission]
  }
  private hasMission(type: string): boolean {
    return this.missions.some(mission => mission.type === type)
  }
  private createMissions(): void {
    if (!this.hasMission('maintain')) {
      this.assignMission(this.createMission('maintain'))
    }
  }

  public update(): void {
    this.createMissions()
    this.spawnRequiredJobs()
    return this.missions.forEach(mission => mission.update())
  }
  public run(): void {
    return this.missions.forEach(mission => mission.run())
  }
}

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
  public attemptSpawnJob(spawn: StructureSpawn, jobName: string): void | Job<JobEntry> {
    const id = Job.ID()
    const name = `${jobName}:${id}`
    const testJob = Collections.jobs.create(jobName)

    const dryRunResult = spawn.spawnCreep(testJob.body, `${jobName}:${id}`, {
      dryRun: true
    })

    if (dryRunResult !== 0) return

    const job = Collections.jobs.create(jobName, id)
    job.creepName = name
    job.room = this.room
    const result = spawn.spawnCreep(job.body, name, {
      memory: { jobName, jobId: id }
    })
    if (result !== 0) {
      return
    }
    this.villagers = [...this.villagers, job]
    console.log('spawned villager', name)
    return job
  }

  private checkMissionNeeds(): { mission: MissionType; job: string }[] {
    return this.missions.reduce((prev, mission) => {
      const jobs = mission.requestJobs()
      return prev.concat(jobs.map(job => ({ mission, job })))
    }, [] as { mission: MissionType; job: string }[])
  }

  private spawnRequiredJobs(): void {
    const needs = this.checkMissionNeeds()
    let currentEl = needs.shift()

    this.spawns.forEach(spawn => {
      if (!currentEl) return
      const job = this.attemptSpawnJob(spawn, currentEl.job)
      if (!job) return
      currentEl.mission.assignVillager(job)

      currentEl = needs.shift()
    })
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
    console.log(JSON.stringify(this.missions.map(m => `${m.type}:${m.id}`)))
    if (!this.hasMission('farm')) {
      this.assignMission(this.createMission('farm'))
    }
    if (!this.hasMission('upgrade-room')) {
      this.assignMission(this.createMission('upgrade-room'))
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

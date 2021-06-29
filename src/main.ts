import { ErrorMapper } from './utils/ErrorMapper'
import { Collections } from './Memory/index'

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  // eslint-disable-next-line
  interface CreepMemory {
    jobName: string
    jobId: string
  }
  // eslint-disable-next-line
  interface Memory {
    uuid: number
    log: any
    [type: string]: {
      [id: string]: any
    }
  }
  // eslint-disable-next-line
  namespace NodeJS {
    // eslint-disable-next-line
    interface Global {
      db: typeof Collections
    }
  }
}

const createVillage = () => {
  console.log('creating village')
  const spawn = Object.values(Game.spawns)[0]
  const room = Object.values(Game.spawns)[0].room
  const village = Collections.villages.create('base', spawn.name)
  village.load({
    type: village.type,
    id: village.id,
    name: village.id,
    room: room.name,
    missions: [],
    villagers: [],
    progress: {}
  })
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`)

  global.db = Collections

  const villages = Collections.villages.loadAll()

  if (!villages.length) createVillage()

  villages
    .map(village => {
      village.update()
      return village
    })
    .map(village => {
      village.run()
      return village
    })

  Object.values(Collections).forEach(collection => collection.saveAll())

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name]
    }
  }
})

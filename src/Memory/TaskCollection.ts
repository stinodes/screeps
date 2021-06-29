import { Task, TaskEntry } from '../Tasks/Task'
import { Collection } from './Collection'
import { Harvest } from '../Tasks/Harvest'
import { Stash } from '../Tasks/Stash'
import { Load } from '../Tasks/Load'
import { Upgrade } from '../Tasks/Upgrade'
import { Build } from '../Tasks/Build'
import { Collect } from '../Tasks/Collect'

export class TaskCollection extends Collection<Task<TaskEntry>> {
  public segment = 'tasks'

  public getClass(type: string): new (id: string) => Task<TaskEntry> {
    switch (type) {
      case 'harvest':
        return Harvest
      case 'stash':
        return Stash
      case 'upgrade':
        return Upgrade
      case 'load':
        return Load
      case 'collect':
        return Collect
      case 'build':
        return Build
      default:
        throw new Error('Not a matching task')
    }
  }
}

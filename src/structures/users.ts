interface ModifiedUser {
  id: string
  timestamp: number
}

export let modifiedUsers: ModifiedUser[] = []

async function clearOldUsers() {
  modifiedUsers = modifiedUsers.filter((user) => user.timestamp > Date.now())
}

export async function addNewUsers(id: string) {
  await clearOldUsers()
  modifiedUsers.push({ id, timestamp: Date.now() + 1000 * 2 * 60 })
}

export async function userModified(id: string) {
  await clearOldUsers() //needs optimization at some point. this could be all in the next loop.

  for (let i = 0; i < modifiedUsers.length; i++) {
    if (modifiedUsers[i].id === id) return true
  }

  return false
}

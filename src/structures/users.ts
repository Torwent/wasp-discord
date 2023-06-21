interface ModifiedUser {
  id: string
  timestamp: number
}

export let modifiedUsers: ModifiedUser[] = []

async function clearOldUsers() {
  modifiedUsers = modifiedUsers.filter((user) => user.timestamp <= Date.now())
}

export async function addNewUsers(id: string) {
  await clearOldUsers()
  modifiedUsers.push({ id, timestamp: Date.now() + 1000 * 2 * 60 })
}

export async function userModified(id: string) {
  await clearOldUsers()
  let result: boolean
  modifiedUsers.forEach((user) => {
    result = user.id === id
    if (result) return result
  })

  return result
}

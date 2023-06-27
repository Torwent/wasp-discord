const modifiedUsers: Set<string> = new Set()

export async function addNewUser(id: string, seconds: number) {
  modifiedUsers.add(id)
  setTimeout(() => modifiedUsers.delete(id), seconds * 1000)
}

export async function isUserModified(id: string) {
  return modifiedUsers.has(id)
}

import { Events } from "discord.js"
import { threadReOpen } from "../interactions/components/close_thread"
import { openThread } from "../interactions/components/open_thread"
import { ExtendedClient } from "./Client"

const helpId =
  process.env.environment === "prod"
    ? "1019686348623454270"
    : "1067124995354001459"

export const forumListen = async (client: ExtendedClient) => {
  console.log("Listening for forum posts!")

  client.on(Events.ThreadCreate, async (thread) => {
    const owner = await thread.fetchOwner()
    const parent = owner.thread.parentId
    if (parent !== helpId) return

    await openThread(thread)
  })
}

export const forumUnarchiveListen = async (client: ExtendedClient) => {
  console.log("Listening for forum unarchive posts!")

  client.on(Events.ThreadUpdate, async (thread) => {
    const owner = await thread.fetchOwner()
    const parent = owner.thread.parentId
    if (parent !== helpId) return

    if (thread.archived) await threadReOpen(thread)
  })
}

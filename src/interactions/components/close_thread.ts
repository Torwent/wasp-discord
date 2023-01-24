import { MenuExtendedInteraction } from "../../typings/interactions"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ThreadChannel,
} from "discord.js"
import { ModalExtendedInteraction } from "../../typings/interactions"

const row = new ActionRowBuilder<ButtonBuilder>()

row.addComponents(
  new ButtonBuilder()
    .setCustomId("solve")
    .setLabel("Solved")
    .setStyle(ButtonStyle.Success)
)

row.addComponents(
  new ButtonBuilder()
    .setCustomId("close")
    .setLabel("Close")
    .setStyle(ButtonStyle.Secondary)
)

row.addComponents(
  new ButtonBuilder()
    .setCustomId("lock")
    .setLabel("Close & Lock")
    .setStyle(ButtonStyle.Danger)
)

function getMsg(user: string) {
  return {
    content:
      "Thank you. Someone will be with you as soon as possible <@" +
      user +
      ">!\n\n\n" +
      "Make sure to post as much information about your issue as possible.\n" +
      "Things that might be useful:" +
      "```\n- Error message in Simba's output.\n- Lines highlighted in red if any.\n- Pictures of both your osrs client and Simba.\n- Description on how to reproduce the issue if you know how.\n- Video recordings that capture either or both the client and Simba.```\n\n" +
      "You can mark the issue as solved or close the post at any moment with the following buttons:",
    components: [row],
  }
}

export async function threadReply(
  interaction: ModalExtendedInteraction | MenuExtendedInteraction
) {
  if (!interaction.channel.isThread()) return
  const thread = interaction.channel
  const op = await thread.fetchStarterMessage()

  return await interaction.reply(getMsg(op.author.id.toString()))
}

export async function threadReOpen(thread: ThreadChannel) {
  const op = await thread.fetchStarterMessage()
  return await thread.send(getMsg(op.author.id.toString()))
}

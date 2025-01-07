import { CommandExtendedInteraction } from "./interaction"
import { getRole } from "./lib"
import { getWSID, supabase } from "./supabase"

export async function access(interaction: CommandExtendedInteraction){
    await interaction.deferReply({ ephemeral: true }).catch((err) => console.error(err))
    const role = getRole(interaction.member, ["Tester", "Scripter", "Moderator", "Administrator"])

    if (role == null) {
        await interaction
            .editReply("You are not allowed to use this command.")
            .catch((err) => console.error(err))
        return
    }

    let user = interaction.options.data[0].value as string

    if (user === "") {
        await interaction.editReply("Discord ID is empty.").catch((err) => console.error(err))
        return
    }

    user = await getWSID(user)
    if (!user) {
        await interaction.editReply("WaspScripts ID not found.").catch((err) => console.error(err))
        return
    }

    const promises = await Promise.all([
        supabase
            .schema("profiles")
            .from("subscription")
            .select("product, subscription, date_start, date_end, cancel")
            .eq("id", user),
        supabase
            .schema("profiles")
            .from("free_access")
            .select("product, date_start, date_end")
            .eq("id", user),
        supabase
            .schema("profiles")
            .from("subscriptions_old")
            .select("product, subscription, date_start, date_end")
            .eq("id", user),
        supabase
            .schema("profiles")
            .from("free_access_old")
            .select("product, date_start, date_end")
            .eq("id", user)
    ])

    for (let i = 0; i < promises.length; i++) {
        let message = "Error trying to get:\n"
        if (promises[i].error) {
            console.error(promises[i].error)
            switch (i) {
                case 0:
                    message += "subscriptions:"
                    break
                case 1:
                    message += "free_access:"
                    break

                case 2:
                    message += "old_subscriptions:"
                    break
                case 3:
                    message += "old_free_access:"
                    break
            }
            message += "\n```\n" + JSON.stringify(promises[i].error) + "\n```\n\n"
        }

        if (message !== "Error trying to get:\n") {
            await interaction.editReply(message)
            return
        }
    }

    const { data: subData } = promises[0]
    const { data: freeData } = promises[1]
    const { data: old_subData } = promises[2]
    const { data: old_freeData } = promises[3]

    if (
        subData.length === 0 &&
        freeData.length === 0 &&
        old_subData.length === 0 &&
        old_freeData.length === 0
    ) {
        await interaction.editReply("No subscriptions or free access data was found for this user.")
        return
    }

    const subscriptions = await Promise.all(
        subData.map(async (sub) => {
            const { data, error } = await supabase
                .schema("scripts")
                .from("products")
                .select("name")
                .eq("id", sub.product)
                .single()

            if (error) {
                await interaction
                    .editReply(
                        "Error trying to get product data for product: \n```\n" +
                            JSON.stringify(error) +
                            "```"
                    )
                    .catch((err) => console.error(err))
                return
            }

            return {
                name: data.name,
                product: sub.product,
                subscription: sub.subscription,
                date_start: new Date(sub.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
                date_end: new Date(sub.date_end).toLocaleString("PT-pt").split(",")[0].trim(),
                cancel: sub.cancel
            }
        })
    )

    const free_access = await Promise.all(
        freeData.map(async (access) => {
            const { data, error } = await supabase
                .schema("scripts")
                .from("products")
                .select("name")
                .eq("id", access.product)
                .single()

            if (error) {
                await interaction
                    .editReply(
                        "Error trying to get product data for product: \n```\n" +
                            JSON.stringify(error) +
                            "```"
                    )
                    .catch((err) => console.error(err))
                return
            }

            return {
                name: data.name,
                product: access.product,
                date_start: new Date(access.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
                date_end: new Date(access.date_end).toLocaleString("PT-pt").split(",")[0].trim()
            }
        })
    )

    const old_subscriptions = await Promise.all(
        old_subData.map(async (sub) => {
            const { data, error } = await supabase
                .schema("scripts")
                .from("products")
                .select("name")
                .eq("id", sub.product)
                .single()

            if (error) {
                await interaction
                    .editReply(
                        "Error trying to get product data for product: \n```\n" +
                            JSON.stringify(error) +
                            "```"
                    )
                    .catch((err) => console.error(err))
                return
            }

            return {
                name: data.name,
                product: sub.product,
                subscription: sub.subscription,
                date_start: new Date(sub.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
                date_end: new Date(sub.date_end).toLocaleString("PT-pt").split(",")[0].trim()
            }
        })
    )

    const old_free_access = await Promise.all(
        old_freeData.map(async (access) => {
            const { data, error } = await supabase
                .schema("scripts")
                .from("products")
                .select("name")
                .eq("id", access.product)
                .single()

            if (error) {
                await interaction
                    .editReply(
                        "Error trying to get product data for product: \n```\n" +
                            JSON.stringify(error) +
                            "```"
                    )
                    .catch((err) => console.error(err))
                return
            }

            return {
                name: data.name,
                product: access.product,
                date_start: new Date(access.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
                date_end: new Date(access.date_end).toLocaleString("PT-pt").split(",")[0].trim()
            }
        })
    )

    if (
        subscriptions.length === 0 &&
        free_access.length === 0 &&
        old_subscriptions.length === 0 &&
        old_free_access.length === 0
    ) {
        await interaction
            .editReply("User has no subscription nor free access data.")
            .catch((err) => console.error(err))
        return
    }

    let message = ""

    if (subscriptions.length > 0) {
        message += "```\nSubscriptions:\n"

        for (let i = 0; i < subscriptions.length; i++) {
            const sub = subscriptions[i]
            message +=
                sub.product +
                " " +
                sub.subscription +
                " From " +
                sub.date_start +
                " To " +
                sub.date_end +
                " Cancel " +
                sub.cancel +
                (sub.cancel ? "  > " : " > ") +
                sub.name
            message += "\n"
        }
        message += "```\n"
    }

    if (free_access.length > 0) {
        message += "```\nFree Access:\n"

        for (let i = 0; i < free_access.length; i++) {
            const access = free_access[i]
            message +=
                access.product +
                " From " +
                access.date_start +
                " To " +
                access.date_end +
                " > " +
                access.name
            message += "\n"
        }
        message += "```\n"
    }

    if (old_subscriptions.length > 0) {
        message += "```\nOld Subscriptions:\n"

        for (let i = 0; i < old_subscriptions.length; i++) {
            const sub = old_subscriptions[i]
            message +=
                sub.product +
                " " +
                sub.subscription +
                " From " +
                sub.date_start +
                " To " +
                sub.date_end +
                " > " +
                sub.name
            message += "\n"
        }
        message += "```\n"
    }

    if (old_free_access.length > 0) {
        message += "```\nOld Free Access:\n"
        for (let i = 0; i < old_free_access.length; i++) {
            const access = old_free_access[i]
            message +=
                access.product +
                " From " +
                access.date_start +
                " To " +
                access.date_end +
                " > " +
                access.name
            message += "\n"
        }
        message += "```\n"
    }

    if (message.length > 1990) message = message.substring(0, 1990) + "\n...\n"
    await interaction.editReply(message).catch((err) => console.error(err))
}


export async function wsid(interaction: CommandExtendedInteraction){   
    await interaction.deferReply({ ephemeral: true })
		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		const id = await getWSID(user)

		await interaction.editReply(id)
	
}
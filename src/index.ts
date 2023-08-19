import "./lib/alias"
import "$lib/env"

import { ExtendedClient } from "$structures/Client"

export const client = new ExtendedClient()

client.start()

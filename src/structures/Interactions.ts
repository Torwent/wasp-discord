import { CommandType, MenuType } from "../typings/interactions"

export class Command {
  constructor(commandOptions: CommandType) {
    Object.assign(this, commandOptions)
  }
}

export class Menu {
  constructor(menuOptions: MenuType) {
    Object.assign(this, menuOptions)
  }
}

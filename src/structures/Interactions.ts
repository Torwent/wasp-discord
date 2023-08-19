import { ButtonType, CommandType, MenuType, ModalType } from "../lib/types/interactions"

export class Command {
	constructor(commandOptions: CommandType) {
		Object.assign(this, commandOptions)
	}
}

export class Button {
	constructor(menuOptions: ButtonType) {
		Object.assign(this, menuOptions)
	}
}

export class Menu {
	constructor(menuOptions: MenuType) {
		Object.assign(this, menuOptions)
	}
}

export class Modal {
	constructor(menuOptions: ModalType) {
		Object.assign(this, menuOptions)
	}
}

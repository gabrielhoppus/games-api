import prisma from "config/database"
import { faker } from "@faker-js/faker"
import { createConsole } from "./console-factories"
import { create } from "domain";


export async function gameBody(id: number) {
    return {
            title: faker.random.words(),
            consoleId: id
        }
}

export async function createGame(id: number){
    return prisma.game.create({
        data: {
            title: faker.random.words(),
            consoleId: id
        }
    })
}

export async function createDuplicatedGame(title: string, consoleId: number){
    return {
        title,
        consoleId
    }
}

export async function noConsoleBody() {
    return {
            title: faker.random.words(),
            consoleId: faker.datatype.number(),
        }
}
import app, { init } from "../src/app";
import { cleanDb } from "./helper";
import supertest from "supertest";
import { createDuplicatedGame, createGame, gameBody, noConsoleBody } from "./factories/game-factories";
import { faker } from "@faker-js/faker";
import { createConsole } from "./factories/console-factories";


beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const api = supertest(app);

describe('GET /games', () => {
    it('should respond with status 200 and an empty array when no games are found', async () => {
        const result = await api.get('/games');
        expect(result.status).toEqual(200);
        expect(result.body).toEqual([]);
    });
    it('should respond with status 200 and an array of games when games are found', async () => {
        const console = await createConsole();
        const games = await createGame(console.id);
        const result = await api.get('/games');
        expect(result.status).toEqual(200);
        expect(result.body).toEqual([
            {
                Console: {
                    id: console.id,
                    name: console.name,
                },
                id: games.id,
                consoleId: games.consoleId,
                title: games.title
            }
        ])
    })
})


describe('GET /games/:id', () => {
    it('should respond with status 404 when no game with the id is found', async () => {
        const id = faker.random.numeric()
        const result = await api.get(`/games/${id}`);
        expect(result.status).toEqual(404)
    })

    it('should respond with a status 200 and the corresponding game ', async () => {
        const console = await createConsole();
        const game = await createGame(console.id);
        const result = await api.get(`/games/${game.id}`)
        expect(result.status).toEqual(200)
        expect(result.body).toEqual({
            id: game.id,
            consoleId: game.consoleId,
            title: game.title
        })
    })
})


describe('POST /games', () => {
    const log = jest.spyOn(console, 'log');
    it('should respond with status 201 and a game is successfully created', async () => {
        const console = await createConsole();
        const body = await gameBody(console.id);
        const result = await api.post('/games').send(body);
        expect(result.status).toEqual(201);
    });
    it('should respond with message "This Console does not exists!" and status 409 if a consoleId is not valid', async () => {
        const body = await noConsoleBody();
        const result = await api.post('/games').send(body);
        expect(result.status).toEqual(409);
        expect(log).toHaveBeenCalledWith({"message": "This console does not exists!"});
    });
    it('should respond with message "This game already exists!" and status 409 if a game is already registered', async () => {
        const console = await createConsole();
        const game = await createGame(console.id);
        const body = await createDuplicatedGame(game.title, game.consoleId)
        const result = await api.post('/games').send(body);
        expect(result.status).toEqual(409);
        expect(log).toHaveBeenCalledWith({"message": "This game already exists!"});
    })
})

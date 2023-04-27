import app, { init } from "../src/app";
import httpStatus from 'http-status';
import { cleanDb } from "./helper";
import { faker } from "@faker-js/faker"
import supertest from 'supertest';
import { createConsole, createDuplicatedConsole } from "./factories/console-factories";
import prisma from "config/database";

const api = supertest(app);

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

describe('GET /consoles', () => {
    it(`should respond with status 200 if there aren't any consoles`, async () => {
        const response = await api.get('/consoles');
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual([]);
    });

    it('should respond with status 200 and correct body if consoles exist', async () => {
        const console = await createConsole();
        const response = await api.get('/consoles');

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual([
            {
                id: console.id,
                name: console.name,
            },
        ]);
    });
});

describe('GET /consoles/:id', () => {
    it(`should respond with status 404 if console doesn't exist`, async () => {
        const id = faker.random.numeric();
        const response = await api.get(`/consoles/${id}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and correct body if console exists', async () => {
        const console = await createConsole();
        const response = await api.get(`/consoles/${console.id}`);
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(
            {
                id: console.id,
                name: console.name,
            },
        );
    });
})

describe('POST /consoles', () => {
    it('should respond with 201 and correct count if created properly', async () => {
        const beforeCount = await prisma.console.count();
        const response = await api.post('/consoles').send({ name: faker.random.words() })
        const afterCount = await prisma.console.count();
        
        expect(response.status).toEqual(httpStatus.CREATED);
        expect(beforeCount).toEqual(0);
        expect(afterCount).toEqual(1);
    });

    it('should respond with message "This console already exists" and status 409 if duplicate console', async () => {
        const log = jest.spyOn(console, 'log');
        const consoles = await createConsole();
        const body = await createDuplicatedConsole(consoles.name);
        const response = await api.post('/consoles').send(body);

        expect(response.status).toEqual(409);
        expect(log).toHaveBeenCalledWith({ "message": "This console already exists!" });
    })
})

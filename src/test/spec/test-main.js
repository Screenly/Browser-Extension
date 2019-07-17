'use strict';

import {
    fetchToken,
    State
} from "../../assets/js/main";

function mockFetchResponse(status, statusText, body) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status: status,
        statusText: statusText,
        json: () => {
            return Promise.resolve(JSON.parse(body));
        },
    });
}

describe("main.fetchToken", function() {
    it("for invalid username and password throws error", async () => {
        //spyOn(window, 'fetch').and.callThrough();
        spyOn(window, 'fetch').and.returnValue(mockFetchResponse(401, "", ""));

        try {
            await fetchToken("myname", "mypass");
            fail();
        } catch(error) {
            expect(error.status).toBe(401);
            expect(window.fetch).toHaveBeenCalledWith( 'https://api.screenlyapp.com/api/v3/tokens/', { method: 'POST', headers: { "Content-Type": 'application/json' }, body: '{"username":"myname","password":"mypass"}'});
        }
    });

    it("for valid username and password returns token", async () => {
        // spyOn(window, 'fetch').and.callThrough();
        spyOn(window, 'fetch').and.returnValue(mockFetchResponse(200, "", "{\"username\":\"siker+lasershark12@norwinter.com\",\"token\":\"deadbeef\"}"));

        let response = await fetchToken("siker+lasershark12@norwinter.com", "banana");

        expect(response.username).toBe("siker+lasershark12@norwinter.com");
        expect(response.token).toBe("deadbeef");
        expect(window.fetch).toHaveBeenCalledWith( 'https://api.screenlyapp.com/api/v3/tokens/', { method: 'POST', headers: { "Content-Type": 'application/json' }, body: '{"username":"siker+lasershark12@norwinter.com","password":"banana"}'});
    });
});

describe("State.normalizeUrl", function() {
    const behaviours = [
        ['https://example.com', 'https://example.com'],
        ['https://www.example.com', 'https://www.example.com'],
        ['https://example.com/', 'https://example.com'],
        ['https://example.com//', 'https://example.com'],
        ['https://example.com/hello/', 'https://example.com/hello/'],
        ['https://bob:secret@example.com/a', 'https://example.com/a'],
        ['https://www.example.com/a?hat=1&cat=2', 'https://www.example.com/a?hat=1&cat=2'],
    ];

    for (const behaviour of behaviours) {
        let k, v;
        [k, v] = behaviour;

        it(`for ${k} returns ${v}`, () => {
            expect(State.normalizeUrl(k))
                .toBe(v);
        });
    }
});

describe("State.simplifyUrl", function() {
    const behaviours = [
        ['https://example.com', 'example.com'],
        ['https://www.example.com', 'example.com'],
        ['https://example.com/', 'example.com'],
        ['https://example.com//', 'example.com'],
        ['https://example.com/hello/', 'example.com/hello'],
        ['https://bob:secret@example.com/a', 'example.com/a'],
        ['https://www.example.com/a?hat=1&cat=2', 'example.com/a?cat=2&hat=1'],
    ];

    for (const behaviour of behaviours) {
        let k, v;
        [k, v] = behaviour;

        it(`for ${k} returns ${v}`, () => {
            expect(State.simplifyUrl(k))
                .toBe(v);
        });
    }
});

class StateMocker {
    constructor() {
        this.fakeStorage = {};
        this.nextFailure = null;

        spyOn(browser.storage.sync, 'set').and.callFake(d => {
            if (this.nextFailure) {
                const theFailure = this.nextFailure;
                this.nextFailure = null;
                return Promise.reject(new Error(theFailure));
            }

            for (const [key, value] of Object.entries(d)) {
                this.fakeStorage[key] = value;
            }
            console.log(this.fakeStorage);
            return Promise.resolve();
        });

        spyOn(browser.storage.sync, 'get').and.callFake(keys => {
            if (typeof keys == "string") {
                return Promise.resolve({keys: this.fakeStorage[keys]});
            }

            if (Array.isArray(keys)) {
                let r = {};
                for (const key of keys) {
                    r[key] = this.fakeStorage[keys];
                }
                return Promise.resolve(r);
            }

            throw "Unimplemented";
        });

        spyOn(browser.storage.sync, 'remove').and.callFake(keys => {
            if (typeof keys == "string") {
                delete this.fakeStorage[keys];
                return Promise.resolve();
            }

            if (Array.isArray(keys)) {
                for (const key of keys) {
                    delete this.fakeStorage[key];
                }
                return Promise.resolve();
            }

        });
    }

    setNextFailure(aFailure) {
        this.nextFailure = aFailure;
    }
}

describe("State", function() {
    it("save asset from empty starting point should work", async () => {
        new StateMocker();

        await State.setSavedAssetState("https://example.com", "abc", true, false);
        const r = await State.getSavedAssetState("https://example.com");

        expect(r).toEqual({
            assetId: "abc",
            withCookies: true,
            withBypass: false
        });
    });

    it("save asset over existing state should overwrite", async () => {
        new StateMocker();

        await State.setSavedAssetState("https://example.com", "abc", true, false);
        await State.setSavedAssetState("https://example.com", "def", false, true);
        const r = await State.getSavedAssetState("https://example.com");

        expect(r).toEqual({
            assetId: "def",
            withCookies: false,
            withBypass: true
        });
    });

    it("save asset with equivalent url should overwrite", async () => {
        new StateMocker();

        await State.setSavedAssetState("https://example.com", "abc", true, false);
        await State.setSavedAssetState("https://example.com/", "def", false, true);
        const r = await State.getSavedAssetState("https://example.com");

        expect(r).toEqual({
            assetId: "def",
            withCookies: false,
            withBypass: true
        });
    });

    it("get asset for equivalent url should get equivalent", async () => {
        new StateMocker();

        await State.setSavedAssetState("https://example.com/?a=0&b=1#banana", "abc", true, false);
        const r = await State.getSavedAssetState("https://example.com/?b=1&a=0");

        expect(r).toEqual({
            assetId: "abc",
            withCookies: true,
            withBypass: false
        });
    });


    it("save asset with null should clear save", async () => {
        new StateMocker();

        await State.setSavedAssetState("https://example.com", "abc", true, false);
        await State.setSavedAssetState("https://example.com", null, false, true);
        const r = await State.getSavedAssetState("https://example.com");

        expect(r).toBeUndefined();
    });

    it("save asset when out of storage space should clear all and save last one", async () => {
        const stateMocker = new StateMocker();

        await State.setSavedAssetState("https://example.com", "abc", true, false);
        stateMocker.setNextFailure("QUOTA_BYTES quota exceeded");
        await State.setSavedAssetState("https://example.com/2", "def", false, true);

        const r = await State.getSavedAssetState("https://example.com");

        expect(r).toBeUndefined();

        const r2 = await State.getSavedAssetState("https://example.com/2");

        expect(r2).toEqual({
            assetId: "def",
            withCookies: false,
            withBypass: true
        });
    });

});
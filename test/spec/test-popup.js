'use strict';

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

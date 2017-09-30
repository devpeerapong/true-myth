import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe';

type Neat = { neat: string };

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`some`', () => {
    const shouldBeFine = Maybe.of({ neat: 'string' });
    assertType<Maybe.Maybe<Neat>>(shouldBeFine);
    const shouldBeNeat = Maybe.of<Neat>(undefined);
    assertType<Maybe.Maybe<Neat>>(shouldBeNeat);

    const someString: Maybe.Maybe<string> = Maybe.of('string');
    switch (someString.variant) {
      case Maybe.Variant.Just:
        expect(someString.unsafelyUnwrap()).toBe('string');
        break;
      case Maybe.Variant.Nothing:
        expect(false).toBe(true); // because this should never happen
        break;
    }

    expect(() => Maybe.just(null)).toThrow();
    expect(() => Maybe.just(undefined)).toThrow();
  });

  test('`nothing`', () => {
    const nothing = Maybe.nothing();
    switch (nothing.variant) {
      case Maybe.Variant.Just:
        expect(true).toBe(false); // because this should never happen
        break;
      case Maybe.Variant.Nothing:
        expect(true).toBe(true); // yay
        break;
    }

    const nothingOnType = Maybe.nothing<string>();
    assertType<Maybe.Maybe<string>>(nothingOnType);
  });

  describe('`of`', () => {
    test('with `null', () => {
      const noneFromNull = Maybe.of<string>(null);
      assertType<Maybe.Maybe<string>>(noneFromNull);
      expect(Maybe.isJust(noneFromNull)).toBe(false);
      expect(Maybe.isNothing(noneFromNull)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const noneFromUndefined = Maybe.of<number>(undefined);
      assertType<Maybe.Maybe<number>>(noneFromUndefined);
      expect(Maybe.isJust(noneFromUndefined)).toBe(false);
      expect(Maybe.isNothing(noneFromUndefined)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromUndefined)).toThrow();
    });

    test('with values', () => {
      const alsoNeat = Maybe.of<Neat>({ neat: 'strings' });
      assertType<Maybe.Maybe<Neat>>(alsoNeat);
      const andThisToo = Maybe.of<Neat>(null);
      assertType<Maybe.Maybe<Neat>>(andThisToo);

      const maybeNumber = Maybe.of(42);
      assertType<Maybe.Maybe<number>>(maybeNumber);
      expect(Maybe.isJust(maybeNumber)).toBe(true);
      expect(Maybe.isNothing(maybeNumber)).toBe(false);
      expect(Maybe.unsafelyUnwrap(maybeNumber)).toBe(42);
    });
  });

  test('`map`', () => {
    const someString = Maybe.of('string');
    const itsLength = Maybe.map(length, someString);
    assertType<Maybe.Maybe<number>>(itsLength);
    expect(itsLength).toEqual(Maybe.just('string'.length));

    const none = Maybe.of<string>(null);
    const noLength = Maybe.map(length, none);
    assertType<Maybe.Maybe<string>>(none);
    expect(noLength).toEqual(Maybe.nothing());
  });

  test('`mapOr`', () => {
    expect(Maybe.mapOr(0, x => x.length, Maybe.just('string'))).toEqual('string'.length);
    expect(Maybe.mapOr(0, x => x.length, Maybe.of<string>(null))).toEqual(0);
  });

  test('`mapOrElse`', () => {
    const length = (s: { length: number }) => s.length;
    const string = 'a string';
    expect(Maybe.mapOrElse(() => 0, length, Maybe.of('a string'))).toBe(string.length);
    expect(Maybe.mapOrElse(() => 0, length, Maybe.nothing())).toBe(0);
  });

  test('`and`', () => {
    expect(Maybe.and(Maybe.of(42), Maybe.of('string'))).toEqual(Maybe.just(42));
    expect(Maybe.and(Maybe.nothing(), Maybe.of('string'))).toEqual(Maybe.nothing());
    expect(Maybe.and(Maybe.nothing(), Maybe.of(42))).toEqual(Maybe.nothing());
    expect(Maybe.and(Maybe.nothing(), Maybe.nothing())).toEqual(Maybe.nothing());
  });

  test('`andThen`', () => {
    const strNum = Maybe.of('42');
    const number = Maybe.of(42);
    const toNumber = (x: string) => Maybe.of(Number(x));
    const toNothing = (x: string) => Maybe.nothing<number>();
    const noString = Maybe.nothing<string>();
    const noNumber = Maybe.nothing<number>();

    expect(Maybe.andThen(toNumber, strNum)).toEqual(number);
    expect(Maybe.andThen(toNothing, strNum)).toEqual(noNumber);
    expect(Maybe.andThen(toNumber, noString)).toEqual(noNumber);
    expect(Maybe.andThen(toNothing, noString)).toEqual(noNumber);
  });

  test('`or`', () => {
    const someAnswer = Maybe.of('42');
    const someWaffles = Maybe.of('waffles');
    const nothing = Maybe.nothing();

    expect(Maybe.or(someAnswer, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(nothing, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(someAnswer, nothing)).toBe(someAnswer);
    expect(Maybe.or(nothing, nothing)).toBe(nothing);
  });

  test('`orElse`', () => {
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.just('42'));
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.just('waffles'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.just('42'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.nothing());
  });

  test('`unwrap`', () => {
    expect(Maybe.unsafelyUnwrap(Maybe.of('42'))).toBe('42');
    expect(() => Maybe.unsafelyUnwrap(Maybe.nothing())).toThrow();
  });

  test('`unwrapOrElse`', () => {
    expect(Maybe.unwrapOrElse(() => 100, Maybe.of(42))).toBe(42);
    expect(Maybe.unwrapOrElse(() => 42, Maybe.nothing())).toBe(42);
  });
});

describe('`Maybe.Just` class', () => {
  test('constructor', () => {
    expect('to be implemented').toBe(false);
  });

  test('`map` method', () => {
    expect(Maybe.just(12).map(x => x + 2)).toEqual(Maybe.just(14));
  });

  test('`mapOr` method', () => {
    expect(Maybe.just(42).mapOr(1, x => x * 2)).toEqual(84);
  });

  test('`mapOrElse` method', () => {
    const someString = Maybe.just('string');
    const aDefault = () => 0;

    expect(someString.mapOrElse(aDefault, length)).toEqual(6);
  });

  test('`or` method', () => {
    const someThing = Maybe.just({ neat: 'thing' });
    const someWaffles = Maybe.just({ neat: 'waffles' });

    expect(someThing.or(someWaffles)).toEqual(someThing);
    expect(someThing.or(Maybe.nothing())).toEqual(someThing);
  });

  test('`orElse` method', () => {
    const someThing = Maybe.just(12);
    const getAnswer = () => Maybe.just(42);

    expect(someThing.orElse(getAnswer)).toEqual(someThing);
  });

  test('`and` method', () => {
    const someThing = Maybe.just({ neat: 'thing' });
    const somethingElse = Maybe.just(['amazing', { tuple: 'thing' }]);

    expect(someThing.and(somethingElse)).toEqual(somethingElse);
  });

  test('`andThen` method', () => {
    const someThing = Maybe.just({ Jedi: 'Luke Skywalker' });
    const toDescription = (dict: { [key: string]: string }) =>
      Maybe.just(
        Object.keys(dict)
          .map(key => `${dict[key]} is a ${key}`)
          .join('\n')
      );

    expect(someThing.andThen(toDescription)).toEqual(Maybe.just('Luke Skywalker is a Jedi'));
  });

  test('`unwrap` method', () => {
    const value = 'value';
    const something = Maybe.just(value);
    expect(something.unsafelyUnwrap()).toEqual(value);
    expect(() => something.unsafelyUnwrap()).not.toThrow();
  });

  test('`unwrapOrElse` method', () => {
    const value = 'value';
    const something = Maybe.just(value);
    expect(something.unwrapOrElse(() => 'other value')).toEqual(value);
  });
});

describe('`Maybe.Nothing` class', () => {
  test('constructor', () => {
    expect('to be implemented').toBe(false);
  });

  test('`map` method', () => {
    const nada = Maybe.nothing<string>();
    expect(nada.map(x => x.length)).toEqual(nada);
  });

  test('`mapOr` method', () => {
    const zip = Maybe.nothing<number>();
    expect(zip.mapOr('yay', String)).toEqual('yay');
  });

  test('`mapOrElse` method', () => {
    const zilch = Maybe.nothing<Neat>();
    expect(zilch.mapOrElse(() => 'potatoes', x => x.neat)).toEqual('potatoes');
  });

  test('`or` method', () => {
    const whiff = Maybe.nothing<boolean>(); // the worst: optional booleans!
    const alt = Maybe.just(false);

    expect(whiff.or(alt)).toEqual(alt);
  });

  test('`orElse` method', () => {
    const notABloomingThing = Maybe.nothing<{ here: string[] }>();
    const fallbackValue = Maybe.just({ here: ['to', 'see'] });
    const fallback = () => fallbackValue;

    expect(notABloomingThing.orElse(fallback)).toEqual(fallbackValue);
  });

  test('`and` method', () => {
    const zeroStuff = Maybe.nothing<Array<string>>();
    expect(zeroStuff.and(Maybe.just('blaster bolts'))).toEqual(zeroStuff);
  });

  test('`andThen` method', () => {
    const zanilchzors = Maybe.nothing();
    const alt = Maybe.just('string');

    expect(zanilchzors.andThen(() => alt)).toEqual(zanilchzors);
  });

  test('`unsafelyUnwrap` method', () => {
    const noStuffAtAll = Maybe.of(null);
    expect(() => noStuffAtAll.unsafelyUnwrap()).toThrow();
  });

  test('`unwrapOrElse` method', () => {
    const srslyNothingHereYo = Maybe.of(undefined);
    const sokay = 'it be all fine tho';
    expect(srslyNothingHereYo.unwrapOrElse(() => sokay)).toEqual(sokay);
  });
});

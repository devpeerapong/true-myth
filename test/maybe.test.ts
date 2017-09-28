import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe';

type Neat = { neat: string };

const length = (s: string) => s.length;

test('`Maybe.some`', () => {
  const shouldBeFine = Maybe.of({ neat: 'string' });
  assertType<Maybe.Maybe<Neat>>(shouldBeFine);
  const shouldBeNeat = Maybe.of<Neat>(undefined);
  assertType<Maybe.Maybe<Neat>>(shouldBeNeat);

  const someString: Maybe.Maybe<string> = Maybe.of('string');
  switch (someString.variant) {
    case Maybe.Variant.Some:
      expect(someString.unwrap()).toBe('string');
      break;
    case Maybe.Variant.Nothing:
      expect(false).toBe(true); // because this should never happen
      break;
  }

  expect(() => Maybe.some(null)).toThrow();
  expect(() => Maybe.some(undefined)).toThrow();
});

test('`Maybe.nothing`', () => {
  const nothing = Maybe.nothing();
  switch (nothing.variant) {
    case Maybe.Variant.Some:
      expect(true).toBe(false); // because this should never happen
      break;
    case Maybe.Variant.Nothing:
      expect(true).toBe(true); // yay
      break;
  }

  const nothingOnType = Maybe.nothing<string>();
  assertType<Maybe.Maybe<string>>(nothingOnType);
});

test('`Maybe.of` with `null', () => {
  const noneFromNull = Maybe.of<string>(null);
  assertType<Maybe.Maybe<string>>(noneFromNull);
  expect(Maybe.isSome(noneFromNull)).toBe(false);
  expect(Maybe.isNothing(noneFromNull)).toBe(true);
  expect(() => Maybe.unwrap(noneFromNull)).toThrow();
});

test('`Maybe.of` with `undefined`', () => {
  const noneFromUndefined = Maybe.of<number>(undefined);
  assertType<Maybe.Maybe<number>>(noneFromUndefined);
  expect(Maybe.isSome(noneFromUndefined)).toBe(false);
  expect(Maybe.isNothing(noneFromUndefined)).toBe(true);
  expect(() => Maybe.unwrap(noneFromUndefined)).toThrow();
});

test('`Maybe.of` with values', () => {
  const alsoNeat = Maybe.of<Neat>({ neat: 'strings' });
  assertType<Maybe.Maybe<Neat>>(alsoNeat);
  const andThisToo = Maybe.of<Neat>(null);
  assertType<Maybe.Maybe<Neat>>(andThisToo);

  const maybeNumber = Maybe.of(42);
  assertType<Maybe.Maybe<number>>(maybeNumber);
  expect(Maybe.isSome(maybeNumber)).toBe(true);
  expect(Maybe.isNothing(maybeNumber)).toBe(false);
  expect(Maybe.unwrap(maybeNumber)).toBe(42);
});

test('`Maybe.map`', () => {
  const someString = Maybe.of('string');
  const itsLength = Maybe.map(length, someString);
  assertType<Maybe.Maybe<number>>(itsLength);
  expect(itsLength).toEqual(Maybe.some('string'.length));

  const none = Maybe.of<string>(null);
  const noLength = Maybe.map(length, none);
  assertType<Maybe.Maybe<string>>(none);
  expect(noLength).toEqual(Maybe.nothing());
});

test('`Maybe.mapOr`', () => {
  expect(Maybe.mapOr(0, x => x.length, Maybe.some('string'))).toEqual('string'.length);
  expect(Maybe.mapOr(0, x => x.length, Maybe.of<string>(null))).toEqual(0);
});

test('`Maybe.mapOrElse`', () => {
  const length = (s: { length: number }) => s.length;
  const string = 'a string';
  expect(Maybe.mapOrElse(() => 0, length, Maybe.of('a string'))).toBe(string.length);
  expect(Maybe.mapOrElse(() => 0, length, Maybe.nothing())).toBe(0);
});

test('`Maybe.and`', () => {
  expect(Maybe.and(Maybe.of(42), Maybe.of('string'))).toEqual(Maybe.some(42));
  expect(Maybe.and(Maybe.nothing(), Maybe.of('string'))).toEqual(Maybe.nothing());
  expect(Maybe.and(Maybe.nothing(), Maybe.of(42))).toEqual(Maybe.nothing());
  expect(Maybe.and(Maybe.nothing(), Maybe.nothing())).toEqual(Maybe.nothing());
});

test('`Maybe.andThen`', () => {
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

test('`Maybe.or`', () => {
  const someAnswer = Maybe.of('42');
  const someWaffles = Maybe.of('waffles');
  const nothing = Maybe.nothing();

  expect(Maybe.or(someAnswer, someWaffles)).toBe(someWaffles);
  expect(Maybe.or(nothing, someWaffles)).toBe(someWaffles);
  expect(Maybe.or(someAnswer, nothing)).toBe(someAnswer);
  expect(Maybe.or(nothing, nothing)).toBe(nothing);
});

test('`Maybe.orElse`', () => {
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.some('42'));
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.some('waffles'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.some('42'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.nothing());
});

test('`Maybe.unwrap`', () => {
  expect(Maybe.unwrap(Maybe.of('42'))).toBe('42');
  expect(() => Maybe.unwrap(Maybe.nothing())).toThrow();
});

test('`Maybe.unwrapOrElse`', () => {
  expect(Maybe.unwrapOrElse(() => 100, Maybe.of(42))).toBe(42);
  expect(Maybe.unwrapOrElse(() => 42, Maybe.nothing())).toBe(42);
});

test('`Some.map`', () => {
  expect(Maybe.some(12).map(x => x + 2)).toEqual(Maybe.some(14));
});

test('`Some.mapOr`', () => {
  expect(Maybe.some(42).mapOr(1, x => x * 2)).toEqual(84);
});

test('`Some.mapOrElse`', () => {
  const someString = Maybe.some('string');
  const aDefault = () => 0;

  expect(someString.mapOrElse(aDefault, length)).toEqual(6);
});

test('`Some.or`', () => {
  const someThing = Maybe.some({ neat: 'thing' });
  const someWaffles = Maybe.some({ neat: 'waffles' });

  expect(someThing.or(someWaffles)).toEqual(someThing);
  expect(someThing.or(Maybe.nothing())).toEqual(someThing);
});

test('`Some.orElse`', () => {
  const someThing = Maybe.some(12);
  const getAnswer = () => Maybe.some(42);

  expect(someThing.orElse(getAnswer)).toEqual(someThing);
});

test('`Some.and`', () => {
  const someThing = Maybe.some({ neat: 'thing' });
  const somethingElse = Maybe.some(['amazing', { tuple: 'thing' }]);

  expect(someThing.and(somethingElse)).toEqual(somethingElse);
});

test('`Some.andThen`', () => {
  const someThing = Maybe.some({ Jedi: 'Luke Skywalker' });
  const toDescription = (dict: { [key: string]: string }) =>
    Maybe.some(
      Object.keys(dict)
        .map(key => `${dict[key]} is a ${key}`)
        .join('\n')
    );

  expect(someThing.andThen(toDescription)).toEqual(Maybe.some('Luke Skywalker is a Jedi'));
});

test('`Some.unwrap`', () => {
  const value = 'value';
  const something = Maybe.some(value);
  expect(something.unwrap()).toEqual(value);
  expect(() => something.unwrap()).not.toThrow();
});

test('`Some.unwrapOrElse`', () => {
  const value = 'value';
  const something = Maybe.some(value);
  expect(something.unwrapOrElse(() => 'other value')).toEqual(value);
});

test('`Nothing.map`', () => {
  const nada = Maybe.nothing<string>();
  expect(nada.map(x => x.length)).toEqual(nada);
});

test('`Nothing.mapOr`', () => {
  const zip = Maybe.nothing<number>();
  expect(zip.mapOr('yay', String)).toEqual('yay');
});

test('`Nothing.mapOrElse`', () => {
  const zilch = Maybe.nothing<Neat>();
  expect(zilch.mapOrElse(() => 'potatoes', x => x.neat)).toEqual('potatoes');
});

test('`Nothing.or`', () => {
  const whiff = Maybe.nothing<boolean>(); // the worst: optional booleans!
  const alt = Maybe.some(false);

  expect(whiff.or(alt)).toEqual(alt);
});

test('`Nothing.orElse`', () => {
  const notABloomingThing = Maybe.nothing<{ here: string[] }>();
  const fallbackValue = Maybe.some({ here: ['to', 'see'] });
  const fallback = () => fallbackValue;

  expect(notABloomingThing.orElse(fallback)).toEqual(fallbackValue);
});

test('`Nothing.and`', () => {
  const zeroStuff = Maybe.nothing<Array<string>>();
  expect(zeroStuff.and(Maybe.some('blaster bolts'))).toEqual(zeroStuff);
});

test('`Nothing.andThen`', () => {
  const zanilchzors = Maybe.nothing();
  const alt = Maybe.some('string');

  expect(zanilchzors.andThen(() => alt)).toEqual(zanilchzors);
});

test('`Nothing.unwrap`', () => {
  const noStuffAtAll = Maybe.of(null);
  expect(() => noStuffAtAll.unwrap()).toThrow();
});

test('`Nothing.unwrapOrElse`', () => {
  const srslyNothingHereYo = Maybe.of(undefined);
  const sokay = 'it be all fine tho';
  expect(srslyNothingHereYo.unwrapOrElse(() => sokay)).toEqual(sokay);
});
import { Effect, CallEffect } from 'redux-saga/effects';

type EffectRT<T extends Effect> = T extends CallEffect<infer R> ? R : never;

type Replace<T, U> = {
  [P in keyof T]: P extends keyof U ? U[P] : T[P];
};

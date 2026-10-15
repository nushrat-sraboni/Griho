// packages/shared/src/index.ts
//
// The front door of the shared toolbox. Both apps import everything from here:
//   import { ERROR_CODES, type Building } from '@griho/shared';
// Add new shared pieces by exporting them below.

export * from './types';
export * from './errors';

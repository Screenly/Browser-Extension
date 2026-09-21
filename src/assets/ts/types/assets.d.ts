// TypeScript 6 reports TS2882 for side-effect imports that have no type
// declarations. The stylesheet imports below are handled by webpack loaders,
// so an ambient module declaration is all the compiler needs.
declare module '*.scss';
declare module '*.css';

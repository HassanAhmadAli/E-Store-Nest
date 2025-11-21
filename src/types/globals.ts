declare global {
  type ValueOf<O extends object> = O[keyof O];
  interface Error {
    [key: string]: string | undefined | null;
  }
}

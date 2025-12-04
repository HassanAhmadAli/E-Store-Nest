import "@total-typescript/ts-reset";

export const getKeyOf = <T extends object>(obj: T) => {
  return Object.keys(obj) as (keyof typeof obj)[];
};
export const getKeysOfTrue = <T extends object>(obj: T) => {
  const x = {} as Record<keyof T, true>;
  const keys = getKeyOf(obj);
  for (const key of keys) {
    x[key] = true;
  }
  return x;
};
declare global {
  type ValueOf<O extends object> = O[keyof O];
  interface Error {
    [key: string]: string | undefined | null;
  }
}

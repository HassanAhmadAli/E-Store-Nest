export const getKeyOf = <T extends object>(obj: T) => {
  return Object.keys(obj) as (keyof typeof obj)[];
};

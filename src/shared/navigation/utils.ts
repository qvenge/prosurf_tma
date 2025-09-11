export const getFirstKey = <T extends object>(obj: T): keyof T | undefined => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return key;
    }
  }
};
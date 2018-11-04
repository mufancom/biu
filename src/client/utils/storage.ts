export function getStorageObject<T>(key: string): T | undefined {
  let json = localStorage.getItem(key);

  if (json) {
    let object = JSON.parse(json);

    if (object) {
      return object as T;
    }
  }

  return undefined;
}

export function setStorageObject<T>(key: string, object: T): void {
  let json = JSON.stringify(object);
  localStorage.setItem(key, json);
}

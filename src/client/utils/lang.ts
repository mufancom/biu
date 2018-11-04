import {ReactNode, ReactNodeArray} from 'react';

export type ObjectMapCallback<T extends object, K extends keyof T> = (
  value: T[K],
  key: K,
  object: T,
) => ReactNode;

export function mapObject<T extends object>(
  object: T,
  callback: ObjectMapCallback<T, keyof T>,
): ReactNodeArray {
  let keys = Object.keys(object);

  let nodes: ReactNodeArray = [];

  for (let key of keys) {
    if (callback && key in object) {
      let node = callback((object as any)[key], key as keyof object, object);

      nodes.push(node);
    }
  }

  return nodes;
}

export function deepCopy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

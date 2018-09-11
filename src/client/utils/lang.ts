import {ReactNode, ReactNodeArray} from 'react';

export type ObjectMapCallback<T extends object, K extends keyof T> = (
  this: T,
  value: T[K],
  key: K,
) => ReactNode;

export function mapObject<T extends object>(
  object: T,
  callback: ObjectMapCallback<T, keyof T>,
): ReactNodeArray {
  let keys = Object.keys(object);

  let nodes: ReactNodeArray = [];

  for (let key of keys) {
    if (callback && key in object) {
      let node = callback.call(object, (object as any)[key], key);

      nodes.push(node);
    }
  }

  return nodes;
}

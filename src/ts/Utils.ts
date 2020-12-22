import { EntryValue, ToAdd } from "@/ts/Types";

// export function toToAddLight(key : string, value : string, collectionName : string){

// }

export function toToAdd(x: EntryValue, collectionName: string = "") {
  const newItem: ToAdd = {
    originalKey: x.key,
    originalValue: x.value,
    key: x.key,
    value: x.value,
    reverse: x.reverse,
    collection: collectionName
  };
  return newItem;
}

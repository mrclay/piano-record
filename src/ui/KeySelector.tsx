import { useStore } from "../store";
import KeySelect from "./KeySelect";
import { ThirdQuality } from "../music-theory/constants";

export default function KeySelector() {
  const [key, setKey] = useStore.key();

  return (
    <KeySelect
      allowEmpty={true}
      musicKey={key}
      onChange={newKey => {
        setKey(newKey);
      }}
    />
  );
}

export interface UseKeyStorage {
  saveKey(params?: URLSearchParams): URLSearchParams;
}

export function useKeyStorage(): UseKeyStorage {
  const [key] = useStore.key();

  function saveKey(params = new URLSearchParams()) {
    if (key) {
      const tonic = key.getTonicNote().toString(false);
      const m = key.getQuality() === ThirdQuality.MINOR ? "m" : "";
      params.set("key", `${tonic}${m}`);
    } else {
      params.delete("key");
    }
    return params;
  }

  return { saveKey };
}

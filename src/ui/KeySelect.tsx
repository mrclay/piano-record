import React from "react";
import { majorKeys, minorKeys, ThirdQuality } from "../music-theory/constants";
import Note from "../music-theory/Note";
import Key from "../music-theory/Key";

Note.unicodeAccidentals = true;

const keys: Key[] = [
  ...majorKeys.map(name => Key.major(name)),
  ...minorKeys.map(name => Key.minor(name)),
];

type KeySelectProps =
  | {
      allowEmpty: true;
      musicKey: Key | null;
      onChange(key: Key | null): void;
    }
  | {
      allowEmpty: false;
      musicKey: Key;
      onChange(key: Key): void;
    };

export default function KeySelect(props: KeySelectProps) {
  return (
    <select
      className="form-control"
      onChange={e => {
        const newKey = keys.find(el => el.toString() === e.target.value);
        if (newKey) {
          props.onChange(newKey);
        } else if (props.allowEmpty) {
          props.onChange(null);
        }
      }}
      defaultValue={props.musicKey?.toString() || ""}
    >
      {props.allowEmpty && <option value="">(none)</option>}
      <optgroup label="major">
        {keys
          .filter(key => key.getQuality() === ThirdQuality.MAJOR)
          .map(key => key + "")
          .map(name => (
            <option key={name}>{name}</option>
          ))}
      </optgroup>
      <optgroup label="minor">
        {keys
          .filter(key => key.getQuality() === ThirdQuality.MINOR)
          .map(key => key + "")
          .map(name => (
            <option key={name}>{name}</option>
          ))}
      </optgroup>
    </select>
  );
}

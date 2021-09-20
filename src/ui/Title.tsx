import React, { useEffect, useRef, useState } from "react";

import { DEFAULT_TITLE } from "../constants";

interface TitleProps {
  onChange(title: string): void;
  title: string;
}

export default function Title({ onChange, title }: TitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(title || "");
  const [saved, setSaved] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const className = value ? "titled" : "untitled";
  return (
    <h2 className={`Title ${className}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          tabIndex={0}
          value={value}
          onInput={e => setValue(e.currentTarget.value)}
          onKeyUp={e => {
            if (e.key === "Enter") {
              setIsEditing(false);
              e.preventDefault();
              onChange(value);
            }
            if (e.key === "Escape") {
              setValue(saved);
              setIsEditing(false);
              e.preventDefault();
            }
            e.stopPropagation();
          }}
          onKeyDown={e => e.stopPropagation()}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setSaved(value);
            setIsEditing(true);
          }}
        >
          {value || DEFAULT_TITLE}
        </button>
      )}
    </h2>
  );
}

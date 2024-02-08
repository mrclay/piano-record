import type { QRL } from "@builder.io/qwik";
import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { DEFAULT_TITLE } from "~/constants";

interface TitleProps {
  onChange: QRL<(title: string) => void>;
  title: string;
}

const Title = component$(({ onChange, title }: TitleProps) => {
  const inputRef = useSignal<Element | undefined>(undefined);
  const value = useSignal(title || "");
  const saved = useSignal(value.value);
  const isEditing = useSignal(false);

  useTask$(({ track }) => {
    track(() => [isEditing.value, inputRef.value]);

    if (isEditing.value && inputRef.value instanceof HTMLInputElement) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  });

  useTask$(({ track }) => {
    track(() => title);
    value.value = title || "";
  });

  const save = $(() => {
    isEditing.value = false;
    onChange(value.value);
  });

  const escape = $(() => {
    value.value = saved.value;
    isEditing.value = false;
  });

  const className = value.value ? "titled" : "untitled";
  return (
    <h2 class={`Title ${className}`}>
      {isEditing.value ? (
        <input
          ref={inputRef}
          type="text"
          tabIndex={0}
          bind:value={value}
          onBlur$={save}
          onKeyUp$={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              escape();
            }
            e.stopPropagation();
          }}
          // onKeyDown$={e => e.stopPropagation()}
        />
      ) : (
        <button
          type="button"
          onClick$={() => {
            saved.value = value.value;
            isEditing.value = true;
          }}
        >
          {value.value || DEFAULT_TITLE}
        </button>
      )}
    </h2>
  );
});

export default Title;

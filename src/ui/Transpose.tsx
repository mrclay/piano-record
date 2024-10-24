interface TransposeProps {
  onChange?: (semitones: number) => void;
  className?: string;
}

export default function Transpose({
  className = "pe-2 py-1",
  onChange,
}: TransposeProps) {
  return (
    <select
      className={className}
      value={0}
      onChange={e => {
        if (onChange) {
          onChange(Number(e.target.value));
          return;
        }

        const url = new URL(location.href);
        url.searchParams.set("transpose", e.target.value);
        location.href = url.toString();
      }}
    >
      {Array.from(Array(25), (_, idx) => idx - 12)
        .reverse()
        .map(val => (
          <option key={val} value={val} className="btn btn-outline-light">
            {val > 0 && `up ${val}`}
            {val === 0 && "Transpose"}
            {val < 0 && `down ${-val}`}
          </option>
        ))}
    </select>
  );
}

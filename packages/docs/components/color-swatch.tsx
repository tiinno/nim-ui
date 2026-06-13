interface Color {
  shade: string;
  value: string;
  name?: string;
}

export function ColorSwatch({ name, colors }: { name: string; colors: Color[] }) {
  return (
    <div className="not-prose my-6">
      <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {name}
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 md:grid-cols-10">
        {colors.map((color) => (
          <div key={color.shade} className="flex flex-col">
            <div
              className="h-16 rounded-lg border border-neutral-200 shadow-sm dark:border-neutral-800"
              style={{ backgroundColor: color.value }}
            />
            <span className="mt-1.5 font-mono text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {color.shade}
            </span>
            <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              {color.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

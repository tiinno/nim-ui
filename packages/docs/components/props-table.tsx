export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export function PropsTable({ props }: { props: PropDefinition[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-neutral-200 shadow-soft dark:border-neutral-800">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            {['Name', 'Type', 'Default', 'Description'].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
          {props.map((prop) => (
            <tr key={prop.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <td className="whitespace-nowrap px-6 py-4">
                <code className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {prop.name}
                  {prop.required && <span className="ml-1 text-error-500">*</span>}
                </code>
              </td>
              <td className="px-6 py-4">
                <code className="whitespace-pre-wrap font-mono text-sm text-primary-700 dark:text-primary-300">
                  {prop.type}
                </code>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {prop.default ? (
                  <code className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-sm text-neutral-400 dark:text-neutral-600">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

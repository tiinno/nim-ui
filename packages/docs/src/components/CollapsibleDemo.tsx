import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@nim-ui/components';

export function CollapsibleBasicDemo() {
  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger>Show more</CollapsibleTrigger>
      <CollapsibleContent>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Hidden content revealed on open.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

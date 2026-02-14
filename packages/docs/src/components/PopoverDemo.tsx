import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  Button,
} from '@nim-ui/components';

export function PopoverBasicDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">This is a basic popover with some content.</p>
      </PopoverContent>
    </Popover>
  );
}

export function PopoverVariantsDemo() {
  return (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Default</Button>
        </PopoverTrigger>
        <PopoverContent variant="default">
          <p className="text-sm">Default variant with subtle border.</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Outline</Button>
        </PopoverTrigger>
        <PopoverContent variant="outline">
          <p className="text-sm">Outline variant with thicker border.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverArrowDemo() {
  return (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">With Arrow</Button>
        </PopoverTrigger>
        <PopoverContent showArrow>
          <p className="text-sm">Popover with arrow indicator.</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Outline + Arrow</Button>
        </PopoverTrigger>
        <PopoverContent variant="outline" showArrow>
          <p className="text-sm">Outline variant with arrow.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverSidesDemo() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top" showArrow>
          <p className="text-sm">Top</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" showArrow>
          <p className="text-sm">Bottom</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left" showArrow>
          <p className="text-sm">Left</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right" showArrow>
          <p className="text-sm">Right</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverCloseDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">With Close Button</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm">Popover with an explicit close button.</p>
          <PopoverClose asChild>
            <Button variant="outline" className="self-end">Close</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

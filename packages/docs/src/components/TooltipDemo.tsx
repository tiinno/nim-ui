import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
} from '@tiinno-ui/components';

export function TooltipBasicDemo() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          This is a tooltip
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TooltipVariantsDemo() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Default</Button>
          </TooltipTrigger>
          <TooltipContent variant="default">
            Default dark tooltip
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Light</Button>
          </TooltipTrigger>
          <TooltipContent variant="light">
            Light tooltip with border
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function TooltipArrowDemo() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">With Arrow</Button>
          </TooltipTrigger>
          <TooltipContent showArrow>
            Tooltip with arrow
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Light + Arrow</Button>
          </TooltipTrigger>
          <TooltipContent variant="light" showArrow>
            Light tooltip with arrow
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function TooltipSidesDemo() {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-4 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top" showArrow>Top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" showArrow>Bottom</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left" showArrow>Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right" showArrow>Right</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

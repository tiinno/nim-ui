import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@tiinno-ui/components';

export function AccordionSingleDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA Accordion pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styling using Tailwind CSS.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It uses CSS animations for smooth open/close transitions.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

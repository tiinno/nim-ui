import { Toaster, toast, Button } from '@tiinno-ui/components';

export function ToastBasicDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast({ title: 'Hello!', description: 'This is a default toast.' })}>
        Default Toast
      </Button>
      <Toaster />
    </div>
  );
}

export function ToastVariantsDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast.success('Changes saved successfully')}>Success</Button>
      <Button onClick={() => toast.error('Something went wrong')}>Error</Button>
      <Button onClick={() => toast.warning('Please check your input')}>Warning</Button>
      <Button onClick={() => toast.info('New version available')}>Info</Button>
      <Toaster />
    </div>
  );
}

export function ToastWithActionDemo() {
  return (
    <div>
      <Button
        onClick={() =>
          toast({
            title: 'Item deleted',
            description: 'The item has been moved to trash.',
            variant: 'default',
            action: {
              label: 'Undo',
              altText: 'Undo the delete action',
              onClick: () => toast.success('Item restored'),
            },
          })
        }
      >
        Delete with Undo
      </Button>
      <Toaster />
    </div>
  );
}

export function ToastPositionDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast.info('Top right toast')}>Top Right</Button>
      <Toaster position="top-right" />
    </div>
  );
}

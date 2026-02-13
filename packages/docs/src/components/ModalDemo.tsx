import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalDescription,
  ModalClose,
  Button,
} from '@tiinno-ui/components';

export function ModalBasic() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>This is the modal content. Click outside or press Escape to close.</p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function ModalWithDescription() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm Deletion</ModalTitle>
          <ModalDescription>
            This action cannot be undone. This will permanently delete the item and all associated data.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex gap-3 mt-4 justify-end">
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button variant="destructive">Delete</Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function ModalWithCloseButton() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="outline">Open with Close Button</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <div className="flex justify-between items-center">
            <ModalTitle>Settings</ModalTitle>
            <ModalClose asChild>
              <button
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close"
              >
                ✕
              </button>
            </ModalClose>
          </div>
        </ModalHeader>
        <ModalBody>
          <p>Settings content goes here. Notice the close button in the header.</p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

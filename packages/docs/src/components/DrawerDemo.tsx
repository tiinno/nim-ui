import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  Button,
} from '@tiinno-ui/components';

export function DrawerRight() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Right Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Right Drawer</DrawerTitle>
          <DrawerDescription>This drawer slides in from the right side.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p>Right drawer content here.</p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function DrawerLeft() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Left Drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Browse the menu items below.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <nav className="flex flex-col gap-2">
            <a href="#" className="text-primary-600 hover:underline">Home</a>
            <a href="#" className="text-primary-600 hover:underline">Products</a>
            <a href="#" className="text-primary-600 hover:underline">About</a>
            <a href="#" className="text-primary-600 hover:underline">Contact</a>
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function DrawerWithClose() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open with Footer</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerDescription>Make changes to your profile here.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-4">
            <p>Profile editing form would go here.</p>
            <div className="flex gap-3 justify-end mt-4">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button>Save Changes</Button>
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

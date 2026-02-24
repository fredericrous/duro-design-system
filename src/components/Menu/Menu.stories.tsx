import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from "./Menu";

const meta: Meta = {
  title: "Components/Menu",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger>
        Options &#9662;
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" alignment="start" sideOffset={4}>
          <Menu.Popup>
            <Menu.Item onClick={() => console.log("Settings")}>
              Settings
            </Menu.Item>
            <Menu.Item onClick={() => console.log("Profile")}>
              Profile
            </Menu.Item>
            <Menu.Item onClick={() => console.log("Logout")}>
              Logout
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

export const WithLinks: Story = {
  render: () => (
    <Menu.Root modal={false}>
      <Menu.Trigger>
        Account &#9662;
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" alignment="end" sideOffset={6}>
          <Menu.Popup>
            <Menu.LinkItem href="#admin">Admin</Menu.LinkItem>
            <Menu.LinkItem href="#settings">Settings</Menu.LinkItem>
            <Menu.LinkItem href="#logout">Logout</Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

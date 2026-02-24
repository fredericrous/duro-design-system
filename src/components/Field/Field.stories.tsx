import type { Meta, StoryObj } from "@storybook/react-vite";
import { css, html } from "react-strict-dom";
import { Field } from "./Field";
import { Input } from "../Input/Input";

const meta: Meta = {
  title: "Components/Field",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Field.Root>
      <Field.Label>Username</Field.Label>
      <Input placeholder="Enter username" />
      <Field.Description>3-32 characters, letters and numbers only.</Field.Description>
    </Field.Root>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <Input variant="error" placeholder="Enter email" />
      <Field.Error>Please enter a valid email address.</Field.Error>
    </Field.Root>
  ),
};

const stackStyles = css.create({
  stack: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 },
});

export const FormExample: Story = {
  render: () => (
    <html.div style={stackStyles.stack}>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Input placeholder="johndoe" />
        <Field.Description>Must be unique.</Field.Description>
      </Field.Root>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Input type="password" placeholder="At least 12 characters" />
        <Field.Description>Minimum 12 characters.</Field.Description>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Confirm Password</Field.Label>
        <Input type="password" variant="error" />
        <Field.Error>Passwords do not match.</Field.Error>
      </Field.Root>
    </html.div>
  ),
};

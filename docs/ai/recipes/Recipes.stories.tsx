import type {Meta, StoryObj} from '@storybook/react'
import {LoginFormRecipe} from './login-form.recipe'
import {DataTableRecipe} from './data-table.recipe'
import {SettingsPageRecipe} from './settings-page.recipe'
import {EmptyStateRecipe} from './empty-state.recipe'
import {ActionMenuRecipe} from './action-menu.recipe'
import {FilterBarRecipe} from './filter-bar.recipe'

const meta: Meta = {
  title: 'Recipes',
}

export default meta
type Story = StoryObj

export const LoginForm: Story = {
  render: () => <LoginFormRecipe />,
}

export const DataTable: Story = {
  render: () => <DataTableRecipe />,
}

export const SettingsPage: Story = {
  render: () => <SettingsPageRecipe />,
}

export const EmptyState: Story = {
  render: () => <EmptyStateRecipe />,
}

export const ActionMenu: Story = {
  render: () => <ActionMenuRecipe />,
}

export const FilterBar: Story = {
  render: () => <FilterBarRecipe />,
}

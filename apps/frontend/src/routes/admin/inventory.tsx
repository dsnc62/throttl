import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/inventory"!</div>
}

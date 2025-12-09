import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/preview")({
  component: Index,
});

function Index() {
  return <div>preview</div>;
}

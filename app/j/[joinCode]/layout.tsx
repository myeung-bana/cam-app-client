import { EventShell } from "@/components/guest/event-shell";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  return <EventShell joinCode={joinCode}>{children}</EventShell>;
}

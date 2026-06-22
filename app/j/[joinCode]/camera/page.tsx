import { CameraRoom } from "@/components/guest/camera-room";

export default async function CameraPage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  return <CameraRoom joinCode={joinCode} />;
}

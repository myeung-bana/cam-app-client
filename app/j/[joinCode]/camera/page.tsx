import { CameraRoom } from "@/components/guest/camera-room";
import { CameraErrorBoundary } from "@/components/guest/camera/camera-error-boundary";

export default async function CameraPage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  return (
    <CameraErrorBoundary>
      <CameraRoom joinCode={joinCode} />
    </CameraErrorBoundary>
  );
}

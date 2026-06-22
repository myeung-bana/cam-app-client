import { ChallengeList } from "@/components/guest/challenge-list";
import { GuestHeader } from "@/components/guest/guest-header";

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  return (
    <div className="min-h-svh bg-[#0a0a0a] pb-28">
      <GuestHeader joinCode={joinCode} />
      <div className="pt-20">
        <ChallengeList />
      </div>
    </div>
  );
}

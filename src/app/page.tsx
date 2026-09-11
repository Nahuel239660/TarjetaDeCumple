import { PublicEventProvider } from "@/components/event-provider";
import { PublicInvitation } from "@/components/public/public-invitation";
import { getPublicEventState } from "@/lib/event-repository.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialState = await getPublicEventState();
  return <PublicEventProvider initialState={initialState}><PublicInvitation /></PublicEventProvider>;
}

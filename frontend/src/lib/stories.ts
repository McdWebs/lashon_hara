import { useQuery } from "@tanstack/react-query";
import { adminRequest } from "./media";

export type PublicStory = { id: string; name: string; story: string; date: string };
export type AdminStory = { id: string; name: string; hideName: boolean; story: string; consent: boolean; attachmentName: string; shown: boolean; date: string };

/** Stories the team chose to show. Empty while the Stories flag is off. */
export function useStories(enabled = true) {
  return useQuery({
    queryKey: ["stories"],
    enabled,
    staleTime: 30_000,
    queryFn: async (): Promise<PublicStory[]> => {
      const res = await fetch("/api/stories", { cache: "no-cache" });
      if (!res.ok) throw new Error("stories_unavailable");
      return ((await res.json()) as { stories: PublicStory[] }).stories;
    },
  });
}

export const adminStories = {
  list: () => adminRequest<{ items: AdminStory[] }>("/stories"),
  show: (id: string, shown: boolean) => adminRequest(`/stories/${id}`, { method: "PATCH", body: JSON.stringify({ shown }) }),
  remove: (id: string) => adminRequest(`/stories/${id}`, { method: "DELETE" }),
};

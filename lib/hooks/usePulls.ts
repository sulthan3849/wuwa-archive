import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db/database';

export function usePulls(uid: string | null, cardPoolType: number) {
  return useQuery({
    queryKey: ['pulls', uid, cardPoolType],
    queryFn: async () => {
      if (!uid) return [];
      const pulls = await db.pulls
        .where('[playerUid+cardPoolType]')
        .equals([uid, cardPoolType])
        .reverse()
        .sortBy('time');
      return pulls;
    },
    enabled: !!uid,
  });
}

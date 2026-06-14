import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db/database';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await db.profiles.toArray();
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { DataService } from '../services/dataService';
import { RawPost } from '../utils/preprocessData';

export const useData = (rawData: RawPost[]) => {
  return useQuery({
    queryKey: ['socialData', rawData],
    queryFn: async () => {
      const dataService = DataService.getInstance();
      return await dataService.loadData(rawData);
    },
    enabled: Boolean(rawData?.length),
  });
};
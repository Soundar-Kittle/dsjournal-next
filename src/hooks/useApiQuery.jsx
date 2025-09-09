import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useApiQuery = ({
	key,
	endpoint,
	method = "GET",
	queryParams = {},
	enabled = true,
	options = {},
}) => {
	return useQuery({
		queryKey: [key, queryParams],
		queryFn: async () => {
			const { data } = await api({
				url: endpoint,
				method,
				params: queryParams,
			});
			return data;
		},
		enabled,
		...options,
	});
};

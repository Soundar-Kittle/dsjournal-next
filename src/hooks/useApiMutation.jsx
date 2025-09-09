import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useApiMutation = ({
	endpoint,
	method = "POST",
	onSuccess,
	onError,
	options = {},
	headers = {},
}) => {
	return useMutation({
		mutationFn: async (body) => {
			const { data } = await api({
				url: endpoint,
				method,
				data: body,
				headers,
			});
			return data;
		},
		onSuccess,
		onError,
		...options,
	});
};

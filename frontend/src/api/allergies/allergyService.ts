import { ApiError, appFetch, fetchConfig } from "../appFetch";
import { Block } from "../block";

export type Allergy = {
  id: number;
  name: string;
  description: string;
  tag: string;
  icon: string;
};

export const getAllergies = async (
  page: number,
  onSuccess?: (block: Block<Allergy>) => void,
  onError?: (err: ApiError) => void
) => {
  const options = await fetchConfig("GET");
  return appFetch(
    `/allergies/getAll?page=${page}`,
    options,
    onSuccess,
    onError
  );
};
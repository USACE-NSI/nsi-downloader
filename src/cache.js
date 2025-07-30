import { getConfiguredCache } from "money-clip";

export default getConfiguredCache({
  version: 1,
  maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
  name: "test-cache",
});

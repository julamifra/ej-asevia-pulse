import { describe, expect, it } from "vitest";

import { buildApiUrl } from "./api/client";

describe("api client", () => {
  it("builds urls with optional query params", () => {
    expect(
      buildApiUrl("/asesorias", {
        search: "madrid",
        page: 2,
        limit: 10,
        provincia: undefined
      })
    ).toBe("http://localhost:3000/api/asesorias?search=madrid&page=2&limit=10");
  });
});

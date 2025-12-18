export default {
  async fetch(request, env, ctx) {
    const X_ACCESS_TOKEN = "684655d7eb7fa4b39ef670d442b79e019433b1aec861d0c2336c27f918c062ad99649121eb15d1303491ff0d0d2da67c"; // ⚠️ move to env later

    const url = "https://stake.com/_api/graphql";

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/graphql+json, application/json",
      "x-access-token": X_ACCESS_TOKEN,
      "x-language": "en",
      "Referer": "https://stake.com/casino/games/crash",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36",
    };

    const body = {
      query: `
        query CrashGameListHistory($limit: Int, $offset: Int) {
          crashGameList(limit: $limit, offset: $offset) {
            id
            startTime
            crashpoint
          }
        }
      `,
      operationName: "CrashGameListHistory",
      variables: { limit: 50, offset: 0 },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.errors) {
        return new Response(
          JSON.stringify({
            error: "Stake API Error",
            details: data.errors,
          }),
          { status: 500, headers: { "Content-Type": "text/json" } }
        );
      }

      const crashList = data?.data?.crashGameList || [];
      const crashpoints = crashList.map((i) => i.crashpoint);

      return new Response(
        JSON.stringify({
          success: true,
          count: crashpoints.length,
          crashpoints,
        }),
        { status: 200, headers: { "Content-Type": "text/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Backend Fetch Failed",
          details: err.message,
        }),
        { status: 500, headers: { "Content-Type": "text/json" } }
      );
    }
  },
};

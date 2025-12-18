export default {
  async fetch(request, env, ctx) {
    const urlObj = new URL(request.url);

    // ===============================
    // CONFIG
    // ===============================
    const X_ACCESS_TOKEN = "684655d7eb7fa4b39ef670d442b79e019433b1aec861d0c2336c27f918c062ad99649121eb15d1303491ff0d0d2da67c";// use wrangler secret

    const STAKE_URL = "https://stake.com/_api/graphql";

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
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

    // ===============================
    // METHOD 1: JSON SAFE MODE
    // ===============================
    if (urlObj.pathname === "/json") {
      try {
        const res = await fetch(STAKE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const text = await res.text();

        // Stake returned HTML (blocked)
        if (text.trim().startsWith("<")) {
          return new Response(
            JSON.stringify({
              success: false,
              mode: "json",
              error: "Stake returned HTML (blocked / challenge)",
              status: res.status,
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        // Safe JSON parse
        const data = JSON.parse(text);

        const crashList = data?.data?.crashGameList || [];
        const crashpoints = crashList.map((i) => i.crashpoint);

        return new Response(
          JSON.stringify({
            success: true,
            mode: "json",
            count: crashpoints.length,
            crashpoints,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            mode: "json",
            error: "Backend Fetch Failed",
            details: err.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // ===============================
    // METHOD 2: RAW RESPONSE MODE
    // ===============================
    if (urlObj.pathname === "/raw") {
      try {
        const res = await fetch(STAKE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const text = await res.text();

        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      } catch (err) {
        return new Response(
          "RAW FETCH ERROR:\n" + err.message,
          { status: 500 }
        );
      }
    }

    // ===============================
    // DEFAULT ROUTE
    // ===============================
    return new Response(
      JSON.stringify({
        message: "Crash Worker Online",
        routes: {
          json: "/json (safe parsed response)",
          raw: "/raw (raw Stake response)",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  },
};

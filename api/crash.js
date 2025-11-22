export default async function handler(req, res) {
  // ------------------------------------
  // HARD-CODE YOUR PRIVATE TOKEN HERE
  // ------------------------------------
  const X_ACCESS_TOKEN = "684655d7eb7fa4b39ef670d442b79e019433b1aec861d0c2336c27f918c062ad99649121eb15d1303491ff0d0d2da67c";  // <---- paste here
  // ------------------------------------

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
      return res.status(500).json({
        error: "Stake API Error",
        details: data.errors,
      });
    }

    const crashList = data?.data?.crashGameList || [];
    const crashpoints = crashList.map((item) => item.crashpoint);

    return res.status(200).json({
      success: true,
      count: crashpoints.length,
      crashpoints,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Backend Fetch Failed",
      details: err.message,
    });
  }
      }

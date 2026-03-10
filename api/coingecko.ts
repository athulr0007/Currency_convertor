export default async function handler(req: any, res: any) {
  const path = (req.query.path as string) || "";
  const params = { ...req.query };
  delete params.path;

  const queryString = new URLSearchParams(params).toString();
  const url = `https://api.coingecko.com/api/v3/${path}?${queryString}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; CurrencyConverter/1.0)",
      },
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from CoinGecko" });
  }
}
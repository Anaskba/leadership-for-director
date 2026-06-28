const OWNER = "Anaskba";
const REPO  = "leadership-for-director";
const FILE  = "data/progress.json";
const GH    = "https://api.github.com";

async function ghRequest(method, path, body) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`${GH}${path}`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = `/repos/${OWNER}/${REPO}/contents/${FILE}`;

  if (req.method === "GET") {
    const r = await ghRequest("GET", path);
    if (!r.ok) return res.status(200).json({});
    const j = await r.json();
    const content = Buffer.from(j.content, "base64").toString("utf8");
    return res.status(200).json(JSON.parse(content));
  }

  if (req.method === "POST") {
    // get current SHA
    const getR = await ghRequest("GET", path);
    let sha;
    if (getR.ok) {
      const j = await getR.json();
      sha = j.sha;
    }
    const content = Buffer.from(JSON.stringify(req.body)).toString("base64");
    const body = { message: "update progress", content, ...(sha ? { sha } : {}) };
    const putR = await ghRequest("PUT", path, body);
    return res.status(putR.ok ? 200 : 500).json({ ok: putR.ok });
  }

  res.status(405).end();
}

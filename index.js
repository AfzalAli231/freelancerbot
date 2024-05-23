const axios = require("axios");

const instance = axios.create({
  baseURL: "https://www.freelancer.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "freelancer-oauth-v1": "<AUTH_TOKEN>",
  },
});

async function runProcess() {
  try {
    const user = await getUser();

    const projects = await getProjects();
    for (const project of projects.filter(
      (project) =>
        project.frontend_project_status === "open" &&
        !project.hireme &&
        project.status === "active" &&
        !project.deleted &&
        !project.nonpublic &&
        listedTags(project.title)
    )) {
      try {
        const {
          bid_stats: { bid_avg },
          id,
          title,
          currency,
          type,
          budget,
          owner_id,
        } = project;
	const random = Math.floor(Math.random() * budget.maximum) + bid_avg;
        console.log(
          {
            bid_avg: Math.floor(bid_avg),
            title,
            currency: currency.name,
            type,
            owner_id,
            min_budget: budget.minimum,
            max_budget: budget.maximum,
          },
        );
        const bidDescription = await generateBid(id);

        const biddingBody = {
          project_id: id,
          profile_id: user.id,
          bidder_id: user.id,
          period: 3,
          milestone_percentage: 20,
          amount: random,
          description: bidDescription,
        };

        const bid = await createBid(biddingBody);
        console.log("🚀 ~ runProcess ~ bid:", bid.id);
      } catch (error) {
        console.log(
          error.response.data.message || error.response.data || error.message
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getUser() {
  const user = await instance.get("/users/0.1/self").then((r) => r.data.result);
  return user;
}

async function getProjects() {
  const projects = await instance
    .get("/projects/0.1/projects/all")
    .then((r) => r.data.result.projects);
  return projects;
}

async function generateBid(projectId) {
  const bidDescription = await axios
    .post(
      "https://www.freelancer.com/ajax-api/bids/generateBidDescription.php?compact=true&new_errors=true&new_pools=true",
      {
        projectId,
        initialBidDescription: "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Freelancer-Auth-V2":
            "<AUTH_TOKEN_V2>",
        },
      }
    )
    .then((r) => r.data.result.description);
  return bidDescription;
}

async function createBid(body) {
  const bid = await instance
    .post("/projects/0.1/bids/", body)
    .then((r) => r.data.result);
  return bid;
}

function listedTags(title) {
  const string = title.toLowerCase().split(" ").join("");
  return (
    (!string.includes("learning") &&
      !string.includes("laravel") &&
      (string.includes("html") ||
        string.includes("js") ||
        string.includes("javascript") ||
        string.includes("json") ||
        string.includes("blockchain") ||
        string.includes("react") ||
        string.includes("eth") ||
        string.includes("dex") ||
        string.includes("nft") ||
        string.includes("dapp") ||
        string.includes("reactnative") ||
        string.includes("figma") ||
        string.includes("firebase") ||
        string.includes("nextjs") ||
        string.includes("web3") ||
        string.includes("solana") ||
        string.includes("sql") ||
        string.includes("mongo") ||
        string.includes("flask") ||
        string.includes("python") ||
        string.includes("node") ||
        string.includes("express") ||
        string.includes("postgres") ||
        string.includes("docker") ||
        string.includes("flutter") ||
        string.includes("kubernete") ||
        string.includes("nest") ||
        string.includes("typescript") ||
        string.includes("mern"))) ||
    string.includes("three")
  );
}

runProcess();

// 5 mints interval
setInterval(runProcess, 1000 * 20);

import { Octokit } from "@octokit/rest";

type Repos = Awaited<ReturnType<Octokit["repos"]["listForUser"]>>["data"];

export interface GenerateOptions {
	token?: string;
	long_title?: boolean;
}

export async function generate(
	username: string,
	prefix: string,
	options: GenerateOptions = {},
): Promise<string[]> {
	const repos = await fetch(username, options.token);
	const sorted = sort(repos);
	return convert(sorted, username, prefix, options.long_title);
}

// Fetch repositories
async function fetch(username: string, token?: string): Promise<any[]> {
	const octokit = token ? new Octokit({ auth: token }) : new Octokit();
	const repos: Repos = [];
	let page = 1;

	while (page <= 10) {
		console.log(`Fetching page ${page} of repositories for ${username}`);
		const { data } = await octokit.repos.listForUser({
			username,
			per_page: 100,
			page,
			sort: "created",
			direction: "desc",
		});

		repos.push(...data.filter((repo) => !repo.fork));
		page++;

		if (data.length < 100) {
			break;
		}
	}

	console.log(`Fetched ${repos.length} repositories for ${username}`);
	return repos;
}

// Sort repositories by date, descending
function sort(repos: Repos): Repos {
	return repos.sort((a, b) =>
		(b.created_at || b.updated_at || "").localeCompare(a.created_at || a.updated_at || ""),
	);
}

// Generate BibTeX citations
function convert(repos: Repos, username: string, prefix: string, long_title?: boolean): string[] {
	return repos.map((repo) => {
		const { name, description, html_url, created_at, updated_at } = repo;
		const date = new Date(created_at || updated_at || "");
		const year = date.getFullYear();
		const month = date.toLocaleString("default", { month: "long" });
		const day = date.getDate();

		const fields: string[] = [
			`author = {${username}}`,
			`title = {${
				long_title ? name.replace(/-/g, " ") + " - " + description : name.replace(/-/g, " ")
			}}`,
			`howpublished = {\\url{${html_url}}}`,
			`month = {${month}}`,
			`year = {${year}}`,
			`day = {${day}}`,
			`url = {${html_url}}`,
			...(description ? [`note = {${description}}`] : []),
		];

		let bib = `@software{${prefix}${name.toLowerCase().replace(/\s/g, "-")},\n`;
		bib += fields.map((field) => `  ${field}`).join(",\n");
		bib += "\n}";

		return bib;
	});
}

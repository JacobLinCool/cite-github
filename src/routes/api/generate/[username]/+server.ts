import { env } from "$env/dynamic/private";
import type { GenerateOptions } from "$lib/server/generate";
import { generate } from "$lib/server/generate";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url }) => {
	const { username } = params;
	const prefix = url.searchParams.get("prefix") ?? "gh-";
	const token = url.searchParams.get("token") || env.GITHUB_TOKEN;

	const options: GenerateOptions = {};
	options.token = token;
	options.long_title = !!url.searchParams.get("long_title");

	const bibtex = await generate(username, prefix, options);

	return new Response(bibtex.join("\n\n"), {
		headers: {
			"content-type": "text/plain; charset=utf-8",
		},
	});
};

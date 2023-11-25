<script lang="ts">
	import { t } from "svelte-i18n";
	import { page } from "$app/stores";

	let username = "JacobLinCool";
	let prefix = "gh-";
	let token = "";
	let long_title = false;

	let bibtex = "";
	let error = "";
	let fetching = false;

	async function generate() {
		if (fetching) {
			return;
		}
		fetching = true;

		try {
			const url = new URL(`/api/generate/${username}`, $page.url);
			url.searchParams.append("prefix", prefix);
			url.searchParams.append("token", token);
			if (long_title) {
				url.searchParams.append("long_title", "1");
			}
			const text = await fetch(url).then((res) => res.text());
			bibtex = text;
			error = "";
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = String(err);
			}
		} finally {
			fetching = false;
		}
	}
</script>

<div class="overflow-auto w-full h-full py-8 px-4">
	<div class="prose mx-auto">
		<h1>Cite GitHub</h1>
		<p>{$t("tool-description")}</p>

		<div class="form-control">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">Username</span>
			</label>
			<input
				type="text"
				class="input input-bordered"
				bind:value={username}
				disabled={fetching}
			/>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">Prefix</span>
			</label>
			<input
				type="text"
				class="input input-bordered"
				bind:value={prefix}
				disabled={fetching}
			/>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text-alt">Prefix for the BibTeX key</span>
			</label>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">GitHub Token</span>
			</label>
			<input
				type="password"
				class="input input-bordered"
				bind:value={token}
				disabled={fetching}
			/>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text-alt">Optional, increases rate limit</span>
			</label>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">Use Long Title for BibTeX Entry</span>
			</label>
			<input type="checkbox" class="checkbox" bind:checked={long_title} disabled={fetching} />
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text-alt">Append description to tail of the title</span>
			</label>

			<button
				class="btn btn-primary mt-4"
				class:animate-pulse={fetching}
				on:click={generate}
				disabled={fetching}
			>
				Generate
			</button>
		</div>

		{#if error}
			<div class="alert alert-error">
				{error}
			</div>
		{/if}

		<textarea
			class="w-full textarea textarea-bordered mt-4"
			rows="10"
			bind:value={bibtex}
			readonly
		></textarea>
	</div>
</div>

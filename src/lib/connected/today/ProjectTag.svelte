<script lang="ts">
	import { tint } from '$lib/client/labels';
	import type { Project } from '$lib/modules/projects/domain/project';

	let { project }: { project: Project | undefined } = $props();
</script>

{#if project}
	<span class="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink-2">
		<span
			class="size-2.5 shrink-0 rounded-[3px]"
			style:background-color={tint(project.color)}
			aria-hidden="true"
		></span>
		<span class="truncate">{project.name}</span>
	</span>
{/if}

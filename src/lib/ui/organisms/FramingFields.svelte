<script lang="ts">
	import Input from '../atoms/Input.svelte';
	import TextArea from '../atoms/TextArea.svelte';
	import NumberedField from '../molecules/NumberedField.svelte';

	type Values = Partial<
		Record<
			'name' | 'objective' | 'audience' | 'deadline' | 'outOfScope' | 'doneDefinition',
			string | null
		>
	>;
	let { values = {} }: { values?: Values } = $props();
</script>

<NumberedField index={1} label="Nom du projet">
	<Input
		name="name"
		required
		maxlength={120}
		value={values.name ?? ''}
		placeholder="Ex. Atelier Pixel"
		class="h-11 text-lg"
	/>
</NumberedField>
<NumberedField index={2} label="L’objectif" hint="En une phrase.">
	<Input name="objective" value={values.objective ?? ''} placeholder="Aider les … à … sans …" />
</NumberedField>
<NumberedField index={3} label="Pour qui ?" hint="La cible, les utilisateurs.">
	<Input name="audience" value={values.audience ?? ''} />
</NumberedField>
<NumberedField index={4} label="Date limite" hint="Optionnelle.">
	<Input name="deadline" type="date" value={values.deadline ?? ''} class="w-auto" />
</NumberedField>
<NumberedField index={5} label="Hors périmètre" hint="Ce qu’on ne fera pas.">
	<TextArea name="outOfScope" value={values.outOfScope ?? ''} />
</NumberedField>
<NumberedField index={6} label="C’est fini quand…" hint="Ta définition de « fini ».">
	<TextArea name="doneDefinition" value={values.doneDefinition ?? ''} />
</NumberedField>

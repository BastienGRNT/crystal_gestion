/** Index at which a dragged card would be inserted, from the pointer position over the column's cards. */
export function dropIndex(container: HTMLElement, clientY: number): number {
	const cards = [...container.querySelectorAll<HTMLElement>('[data-card]')];
	const index = cards.findIndex((card) => {
		const box = card.getBoundingClientRect();
		return clientY < box.top + box.height / 2;
	});
	return index === -1 ? cards.length : index;
}

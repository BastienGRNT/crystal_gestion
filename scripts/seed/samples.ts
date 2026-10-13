/** Small but real sample files for the demo: they open in the preview like real uploads. */

export function mockupSvg(title: string, accent: string, background = '#f6efe6') {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
	<rect width="1200" height="800" fill="${background}"/>
	<rect x="0" y="0" width="1200" height="72" fill="#fff"/>
	<circle cx="56" cy="36" r="16" fill="${accent}"/>
	<rect x="90" y="26" width="140" height="20" rx="10" fill="#2b2b2b" opacity=".85"/>
	<rect x="860" y="26" width="80" height="20" rx="10" fill="#2b2b2b" opacity=".25"/>
	<rect x="960" y="26" width="80" height="20" rx="10" fill="#2b2b2b" opacity=".25"/>
	<rect x="1060" y="20" width="100" height="32" rx="16" fill="${accent}"/>
	<rect x="80" y="130" width="500" height="560" rx="28" fill="${accent}" opacity=".18"/>
	<circle cx="330" cy="400" r="150" fill="${accent}" opacity=".55"/>
	<text x="640" y="200" font-family="Georgia, serif" font-size="54" fill="#2b2b2b">${title}</text>
	<rect x="640" y="240" width="420" height="16" rx="8" fill="#2b2b2b" opacity=".2"/>
	<rect x="640" y="270" width="360" height="16" rx="8" fill="#2b2b2b" opacity=".2"/>
	<text x="640" y="360" font-family="Helvetica, Arial" font-size="40" font-weight="700" fill="${accent}">42,00 €</text>
	<rect x="640" y="410" width="240" height="64" rx="32" fill="#2b2b2b"/>
	<text x="690" y="451" font-family="Helvetica, Arial" font-size="22" fill="#fff">Ajouter au panier</text>
	<rect x="640" y="520" width="120" height="120" rx="18" fill="${accent}" opacity=".35"/>
	<rect x="780" y="520" width="120" height="120" rx="18" fill="${accent}" opacity=".25"/>
	<rect x="920" y="520" width="120" height="120" rx="18" fill="${accent}" opacity=".15"/>
</svg>`;
}

export function logoSvg(letter: string, color: string) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
	<rect width="512" height="512" rx="120" fill="${color}"/>
	<circle cx="256" cy="256" r="150" fill="none" stroke="#fff" stroke-width="28"/>
	<text x="256" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="#fff">${letter}</text>
</svg>`;
}

/** A one-page PDF with correct cross-reference offsets. */
export function simplePdf(lines: string[]) {
	const text = lines
		.map(
			(line, i) =>
				`${i === 0 ? '/F1 22 Tf' : '/F1 13 Tf'} ${i === 0 ? '' : '0 -26 Td '}(${line}) Tj`
		)
		.join(' ');
	const stream = `BT 72 760 Td ${text} ET`;
	const objects = [
		'<</Type/Catalog/Pages 2 0 R>>',
		'<</Type/Pages/Kids[3 0 R]/Count 1>>',
		'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
		`<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
		'<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'
	];
	let body = '%PDF-1.4\n';
	const offsets: number[] = [];
	objects.forEach((object, i) => {
		offsets.push(body.length);
		body += `${i + 1} 0 obj\n${object}\nendobj\n`;
	});
	const xref = body.length;
	body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	body += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
	body += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
	return body;
}

export const brief = `# Brief — Atelier Pixel

**Client** : Léa, céramiste (Lyon)
**Objectif** : vendre les pièces en ligne, sans dépendre d'Etsy.

## Pages
- Accueil : les dernières pièces, l'atelier en photo
- Boutique : filtres par collection, stock en direct
- Page produit : 3 à 5 photos, dimensions, entretien
- À propos, contact, CGV

## Contraintes
- Paiement Stripe (CB + Apple Pay)
- Livraison Colissimo, retrait à l'atelier possible
- Léa met à jour le stock elle-même depuis son téléphone
`;

export const catalogue = `reference,nom,collection,prix,stock
TS-01,Tasse sauge,Quotidien,32,12
TS-02,Tasse terracotta,Quotidien,32,8
BL-04,Bol à ramen,Table,48,5
VS-11,Vase galet,Maison,65,3
AS-07,Assiette plate crème,Table,38,10
`;

export const architecture = `# Appli Récolte — notes d'archi

- Front : Expo (React Native) ou Capacitor + Svelte ? → décision à prendre
- Back : Supabase (auth + Postgres + stockage photos)
- Hors ligne d'abord : les jardins n'ont pas toujours de réseau

\`\`\`sql
create table plantings (
  id uuid primary key,
  garden_id uuid not null,
  crop text not null,
  sown_on date,
  harvested_on date
);
\`\`\`
`;

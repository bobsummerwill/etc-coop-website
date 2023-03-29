const fs = require("fs");
const glob = require("glob");
const yaml = require("yaml");

// helper functions

const getMetaData = function (mdFile) {
	const buffer = fs.readFileSync(mdFile);
	const fileContent = buffer.toString();
	let metadata = {};

	const metas = /---(.*?)---/s.exec(fileContent);
	if (metas.length > 0) {
		const clearMeta = metas[0].replaceAll("---", "");
		try {
			metadata = yaml.parse(clearMeta);
		} catch ($e) {}
	}

	return metadata;
};

const uuidv4 = function () {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16)
	);
};

// main process

const langs = ["en", "cn"];
const website = "https://etccooperative.org";

for (const lang of langs) {
	const folder = `./src/contents/posts/${lang}`;

	let xml = "";
	let items = "";

	fs.readdirSync(folder)
		.reverse()
		.forEach((file) => {
			const mdFiles = glob.globSync(`${folder}/${file}/*.md`);
			if (mdFiles.length > 0) {
				const mdFile = mdFiles[0];

				const metadata = getMetaData(mdFile);

				/*
          const imgFiles = glob.globSync(`${folder}/${file}/*.{jpeg,jpg,png}`);

          if (imgFiles.length > 0) {
            let featuredImgPath = imgFiles[0];
            const folderRelative = `${folder}/${file}/`.replace("./", "");
            const featuredImageName = featuredImgPath.replace(folderRelative, "");
          }
        */

				items += `<item>
                    <guid isPermaLink="false">${uuidv4()}</guid>
                    <title>${metadata.title || ""}</title>
                    <link>${website}/${file}</link>
                  </item>`;

				xml = `<?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0"
                  xml:base="https://www.trtworld.com" 
                  xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"
                  xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:foaf="http://xmlns.com/foaf/0.1/"
                  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
                  xmlns:media="http://search.yahoo.com/mrss/">
                >
                <channel>
                  <atom:link href="${website}/rss/feed.${lang}.xml" rel="self" type="application/rss+xml"/>
                  <title>ETC Cooperative</title>
                  <link>${website}</link>
                  <description>Accelerating the growth of Ethereum Classic</description>
                  ${items}
                </channel>
                </rss>`;
			}
		});

	fs.writeFileSync(`./public/rss/feed.${lang}.xml`, xml);
}

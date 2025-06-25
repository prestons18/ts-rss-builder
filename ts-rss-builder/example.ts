import { generateRSS } from "./src";

async function main() {
  try {
    const rss = generateRSS({
      title: "My Podcast",
      description: "Latest episodes",
      site: "https://example.com",
      feedUrl: "https://example.com/feed.xml",
      language: "en-GB",
      items: [
        {
          title: "Episode 1",
          link: "https://example.com/ep1",
          pubDate: new Date(),
          description: "Description",
          category: ["Podcast", "Tech"],
          content: "Content",
          enclosure: {
            url: "https://example.com/ep1.mp3",
            length: 123456,
            type: "audio/mpeg",
          },
        },
      ],
    });

    console.log(rss);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

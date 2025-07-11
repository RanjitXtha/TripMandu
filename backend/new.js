import { writeFileSync } from "fs";

const categorizedDestinations = [
  { name: "Nanglo Restaurant", category: "restaurant" }, // Legacy and well-known chain
  { name: "Bhojan Griha", category: "restaurant" }, // Cultural, heritage building
  { name: "OR2K", category: "restaurant" }, // Popular with tourists
  { name: "Le Sherpa", category: "restaurant" }, // Known fine dining
];

// Wikipedia API fetch helper using search + summary
async function fetchWikipediaData(place) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    place.name + " Kathmandu Nepal"
  )}&format=json&origin=*`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const bestMatch = searchData.query?.search?.[0]?.title;
    if (!bestMatch) {
      return {
        name: place.name,
        categories: Array.isArray(place.category)
          ? place.category
          : [place.category],
        error: "No Wikipedia match found.",
      };
    }

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      bestMatch
    )}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
      return {
        name: place.name,
        categories: Array.isArray(place.category)
          ? place.category
          : [place.category],
        error: "Summary not found.",
      };
    }

    const data = await summaryRes.json();

    // Normalize place.category to array
    const categories = Array.isArray(place.category)
      ? [...place.category]
      : [place.category];

    const desc = (data.extract || "").toLowerCase();

    // Add categories based on description keywords
    if (
      desc.includes("temple") ||
      desc.includes("stupa") ||
      desc.includes("buddha")
    ) {
      categories.push("temple", "religious");
    }
    if (
      desc.includes("durbar") ||
      desc.includes("palace") ||
      desc.includes("historic") ||
      desc.includes("museum")
    ) {
      categories.push("historic", "monument");
    }
    if (desc.includes("market") || desc.includes("bazaar")) {
      categories.push("market", "business");
    }
    if (
      desc.includes("garden") ||
      desc.includes("lake") ||
      desc.includes("pond") ||
      desc.includes("park")
    ) {
      categories.push("park", "natural");
    }
    if (desc.includes("monastery") || desc.includes("gompa")) {
      categories.push("monastery", "religious");
    }
    if (desc.includes("hotel")) {
      categories.push("hotel", "business");
    }
    if (desc.includes("restaurant")) {
      categories.push("restaurant", "business");
    }
    if (desc.includes("cafe")) {
      categories.push("cafe", "business");
    }
    if (
      desc.includes("tourist attraction") ||
      desc.includes("tourist spot") ||
      desc.includes("attraction")
    ) {
      categories.push("tourist_attraction");
    }
    if (
      desc.includes("business") ||
      desc.includes("company") ||
      desc.includes("office")
    ) {
      categories.push("business");
    }

    // Remove duplicates and lowercase categories
    const uniqueCategories = Array.from(
      new Set(categories.map((c) => c.toLowerCase()))
    );

    return {
      name: place.name,
      wiki_title: data.title,
      description: data.extract,
      image: data.thumbnail?.source || null,
      coordinates: data.coordinates || null,
      wikiUrl: data.content_urls?.desktop?.page || null,
      categories: uniqueCategories,
    };
  } catch (err) {
    return {
      name: place.name,
      categories: Array.isArray(place.category)
        ? place.category
        : [place.category],
      error: err.message,
    };
  }
}
async function enrichAllDestinations() {
  const enriched = [];

  for (const place of categorizedDestinations) {
    console.log(`Fetching data for: ${place.name}`);
    const data = await fetchWikipediaData(place);
    enriched.push(data);
    await new Promise((res) => setTimeout(res, 500)); // delay to respect rate limits
  }

  writeFileSync("restaurants.json", JSON.stringify(enriched, null, 2));
  console.log("✅ All done! Data saved to enriched_destinations.json");
}

enrichAllDestinations();

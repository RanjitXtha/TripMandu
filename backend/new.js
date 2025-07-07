import { writeFileSync } from "fs";

const categorizedDestinations = [
  // 🛕 Religious (Hindu & Buddhist temples, stupas, shrines)
  { name: "Pashupatinath Temple", category: "religious" },
  { name: "Boudhanath Stupa", category: "religious" },
  { name: "Swayambhunath Stupa", category: "religious" },
  { name: "Budhanilkantha Temple", category: "religious" },
  { name: "Changu Narayan Temple", category: "religious" },
  { name: "Seto Machindranath Temple", category: "religious" },
  { name: "Kasthamandap Temple", category: "religious" },
  { name: "Taleju Temple", category: "religious" },
  { name: "Jagat Narayan Temple", category: "religious" },
  { name: "Shree Guhyeshwari Temple", category: "religious" },
  { name: "Bajrabarahi Temple", category: "religious" },
  { name: "Surya Vinayak Temple", category: "religious" },
  { name: "Dakshinkali Temple", category: "religious" },
  { name: "Doleshwar Mahadev Temple", category: "religious" },
  { name: "Tika Bhairab Temple", category: "religious" },
  { name: "Bhimsen Temple", category: "religious" },

  // 🏛️ Historic / Heritage Squares
  { name: "Kathmandu Durbar Square", category: "historic" },
  { name: "Patan Durbar Square", category: "historic" },
  { name: "Bhaktapur Durbar Square", category: "historic" },
  { name: "Hanuman Dhoka", category: "historic" },
  { name: "Dattatreya Square", category: "historic" },
  { name: "55 Window Palace", category: "historic" },
  { name: "Sundari Chowk", category: "historic" },
  { name: "Golden Temple (Hiranya Varna Mahavihar)", category: "historic" },
  { name: "Nagbahal Hiti", category: "historic" },
  { name: "Pulchowk Stupa", category: "historic" },
  { name: "Ashok Stupa (Lalitpur)", category: "historic" },

  // 🧘 Monasteries
  { name: "Kopan Monastery", category: "monastery" },
  { name: "White Monastery (Seto Gumba)", category: "monastery" },
  { name: "Pharping Monastery", category: "monastery" },
  { name: "Panga Mahavihar", category: "monastery" },

  // 🏞️ Natural / Parks
  { name: "Garden of Dreams", category: "natural" },
  { name: "Manjushree Park", category: "natural" },
  { name: "Taudaha Lake", category: "natural" },
  { name: "Shankhamul Ghat", category: "natural" },

  // 🛍️ Markets / Cultural Streets
  { name: "Thamel", category: "market" },
  { name: "Asan Bazaar", category: "market" },
  { name: "Indra Chowk", category: "market" },
  { name: "Freak Street", category: "market" },
  { name: "Itum Bahal", category: "market" },

  // 🖼️ Museums / Palaces
  { name: "Narayanhiti Palace Museum", category: "museum" },
  { name: "National Museum of Nepal", category: "museum" },
  { name: "Natural History Museum", category: "museum" },
  { name: "Tribhuvan Museum", category: "museum" },

  // 🏘️ Heritage Towns / Settlements
  { name: "Sankhu", category: "village" },
  { name: "Kirtipur", category: "village" },

  // 🏛️ Patan / Lalitpur
  { name: "Patan Museum", category: "museum" },
  { name: "Kumbheshwar Temple", category: "religious" },
  { name: "Mahabouddha Temple", category: "religious" },
  { name: "Kwa Bahal (Golden Temple)", category: "monastery" },
  { name: "Ashok Stupa", category: "historic" },
  { name: "Machhendranath Temple (Patan)", category: "religious" },
  { name: "Rudravarna Mahavihar", category: "monastery" },
  { name: "Bhinchhebahal", category: "historic" },
  { name: "Yatkhā Bahal", category: "historic" },
  { name: "Harishankar Temple", category: "religious" },

  // 🏛️ Bhaktapur
  { name: "Nyatapola Temple", category: "religious" },
  { name: "Bhaktapur Durbar Square", category: "historic" },
  { name: "55 Window Palace", category: "historic" },
  { name: "Dattatreya Temple", category: "religious" },
  { name: "Pottery Square", category: "market" },
  { name: "Taumadhi Square", category: "historic" },
  { name: "Peacock Window", category: "historic" },
  { name: "Siddha Pokhari", category: "natural" },
  { name: "Nagarkot View Tower", category: "natural" },
  { name: "Changunarayan Museum", category: "museum" }
];


// Wikipedia API fetch helper using search + summary
async function fetchWikipediaData(place) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(place.name)}&format=json&origin=*`;
  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const bestMatch = searchData.query?.search?.[0]?.title;
    if (!bestMatch) {
      return { 
        name: place.name, 
        categories: Array.isArray(place.category) ? place.category : [place.category], 
        error: "No Wikipedia match found." 
      };
    }

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
      return { 
        name: place.name, 
        categories: Array.isArray(place.category) ? place.category : [place.category], 
        error: "Summary not found." 
      };
    }

    const data = await summaryRes.json();

    // Normalize place.category to array
    const categories = Array.isArray(place.category) ? [...place.category] : [place.category];

    const desc = (data.extract || "").toLowerCase();

    // Add categories based on description keywords
    if (desc.includes("temple") || desc.includes("stupa") || desc.includes("buddha")) {
      categories.push("temple", "religious");
    }
    if (desc.includes("durbar") || desc.includes("palace") || desc.includes("historic") || desc.includes("museum")) {
      categories.push("historic", "monument");
    }
    if (desc.includes("market") || desc.includes("bazaar")) {
      categories.push("market", "business");
    }
    if (desc.includes("garden") || desc.includes("lake") || desc.includes("pond") || desc.includes("park")) {
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
    if (desc.includes("tourist attraction") || desc.includes("tourist spot") || desc.includes("attraction")) {
      categories.push("tourist_attraction");
    }
    if (desc.includes("business") || desc.includes("company") || desc.includes("office")) {
      categories.push("business");
    }

    // Remove duplicates and lowercase categories
    const uniqueCategories = Array.from(new Set(categories.map(c => c.toLowerCase())));

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
      categories: Array.isArray(place.category) ? place.category : [place.category], 
      error: err.message 
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

  writeFileSync("enriched_destinations.json", JSON.stringify(enriched, null, 2));
  console.log("✅ All done! Data saved to enriched_destinations.json");
}

enrichAllDestinations();



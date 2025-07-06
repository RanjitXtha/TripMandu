import React, { useState } from 'react';
import axios from 'axios';

interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

interface WikiPageDetail {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
}

const WikipediaSearch: React.FC = () => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<WikiPageDetail | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;

    setLoading(true);
    setSelectedPage(null);
    try {
      const response = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: term,
          format: 'json',
          origin: '*'
        }
      });

      const fetchedResults: WikiSearchResult[] = response.data.query.search.map((item: any) => ({
        pageid: item.pageid,
        title: item.title,
        snippet: item.snippet,
      }));

      setResults(fetchedResults);
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageDetail = async (pageid: number) => {
    try {
      const response = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          pageids: pageid,
          prop: 'extracts|pageimages|coordinates',
          exintro: true,
          explaintext: true,
          pithumbsize: 500,
          format: 'json',
          origin: '*'
        }
      });

      const pageData = response.data.query.pages[pageid];
      const detail: WikiPageDetail = {
        pageid: pageData.pageid,
        title: pageData.title,
        extract: pageData.extract,
        thumbnail: pageData.thumbnail,
        coordinates: pageData.coordinates?.[0],
      };

      setSelectedPage(detail);
    } catch (error) {
      console.error('Error fetching page details:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search Wikipedia..."
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {results.map(result => (
            <li key={result.pageid} className="mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">{result.title}</h2>
              <p dangerouslySetInnerHTML={{ __html: result.snippet }} />

              <button
                onClick={() => fetchPageDetail(result.pageid)}
                className="text-blue-600 underline mt-1"
              >
                Read more
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedPage && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-2xl font-bold mb-2">{selectedPage.title}</h2>
          {selectedPage.thumbnail && (
            <img
              src={selectedPage.thumbnail.source}
              alt={selectedPage.title}
              className="mb-3 max-w-full"
            />
          )}
          <p>{selectedPage.extract}</p>
          {selectedPage.coordinates && (
            <p className="mt-2 text-sm text-gray-600">
              📍 Coordinates: {selectedPage.coordinates.lat}, {selectedPage.coordinates.lon}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WikipediaSearch;

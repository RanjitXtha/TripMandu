import { useState } from "react"
import axios from "axios";
interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

const Search = () => {
    const [term,setTerm] =  useState('');
      const [results, setResults] = useState<WikiSearchResult[]>([]);
    
    const handleSearch = async()=>{
        if(!term.trim())return;

        try{

       
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
     }catch(err){
        console.log(err);
     }

    
    }
  return (
    <div>
        <input type="text" onChange={(e)=>setTerm(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
    </div>
  )
}

export default Search
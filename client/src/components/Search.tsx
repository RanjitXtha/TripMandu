import { useState } from 'react'
import axios from 'axios';

interface ResultType{
    pageid:number,
    snippet:string,
    title:string

}
const Search = () => {
    const [term,setTerm] = useState('');
    const [results,setResults] = useState<ResultType[]>([]);

    const handleSearch= async()=>{
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

      const result = response.data.query.search.map((data:ResultType)=>{
        return{
            pageid:data.pageid,
            snippet:data.snippet,
            title:data.title
        }
      })
      console.log(result)
      setResults(result);


        }catch(err){
            console.log(err)
        }

    }
  return (
    <div>
        <input type="text" onChange={(e)=>setTerm(e.target.value)}  />
        <button onClick={handleSearch}>Search</button>

        <div>
            <ul>
          {results.map(result => (
            <li key={result.pageid} className="mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">{result.title}</h2>
              <p dangerouslySetInnerHTML={{ __html: result.snippet }} />

              <button
                
                className="text-blue-600 underline mt-1"
              >
                Read more
              </button>
            </li>
          ))}
        </ul>
      
        </div>
    </div>
  )
}

export default Search
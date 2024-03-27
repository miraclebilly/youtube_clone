import React from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Wrapper from "../styles/Search";
import { SearchIcon } from "./Icons";

function Search() {
  const match = useMatch("/results/:searchQuery");
  const navigate = useNavigate();
  const searchInputRef = React.useRef();
  

  React.useEffect(() => {
    if(match?.params){
      searchInputRef.current = match.params.searchQuery;
    }
  }, [match])

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget)
    const searchQuery = String(formData.get('search'))
    if (!searchQuery.trim()) return;
    navigate(`/results/${searchQuery}`);
  }

  return (
    <Wrapper>
      <form onSubmit={handleSubmit}>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Search"
          autoComplete="off"
        />
        <button aria-label="Search" type="submit">
          <SearchIcon />
        </button>
      </form>
    </Wrapper>
  );
}

export default Search;

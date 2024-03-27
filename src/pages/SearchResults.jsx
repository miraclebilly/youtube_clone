import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import ChannelInfo from "../components/ChannelInfo";
import ErrorMessage from "../components/ErrorMessage";
import NoResults from "../components/NoResults";
import TrendingCard from "../components/TrendingCard";
import Skeleton from "../skeletons/TrendingSkeleton";
import Wrapper from "../styles/Trending";
import { searchVideosAndProfiles } from "../utils/supabase";

const StyledChannels = styled.div`
  margin-top: 1rem;
`;

function SearchResults() {
  const {searchQuery} = useParams();
  const { isLoading, isError, isSuccess, error, data } = useQuery(
    ['SearchResults', searchQuery], () => 
    searchVideosAndProfiles(searchQuery), {
    enabled: !!searchQuery
  })

  if (isLoading) return <Skeleton />
  if (isError) return <ErrorMessage error={error} />
  if (isSuccess && !data.videos?.length && !data.profiles?.length) {
    return (
      <NoResults
        title="No results found"
        text="Try different keywords or remove search filters"
      />
    )
  }

  

  return (
    <Wrapper>
      <h2>Search Results</h2>
      <StyledChannels>
        {data.profiles?.map(channel => (
          <ChannelInfo key={channel.id} channel={channel} />
        ))}
      </StyledChannels>
      {data.videos?.map(video => (
        <TrendingCard key={video.id} video={video} />
      ))}
    </Wrapper>
  );
}

export default SearchResults;

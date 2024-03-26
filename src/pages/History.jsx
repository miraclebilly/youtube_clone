import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { HistoryIcon } from "../components/Icons";
import SignUpCard from "../components/SignUpCard";
import TrendingCard from "../components/TrendingCard";
import useCurrentProfile from "../hooks/useCurrentProfile";
import Skeleton from "../skeletons/TrendingSkeleton";
import Wrapper from "../styles/Trending";
import { getHistoryVideos } from "../utils/supabase";

function History() {  
  
  const profile = useCurrentProfile()
  const profileId = profile?.id;
  const { isLoading, isError, error, data } = useQuery(
    ['LikedVideos', profileId], () => getLikedVideos(profileId),
    {
      enable: !!profile,
    }
  );

  if (!profile) {
    return <SignUpCard 
    icon={<HistoryIcon />}
    title="keep track of what you watch"
    description="Watch history isn't viewable when signed"

    />
  }
  if(isLoading) return <Skeleton />
  if(isError) return <ErrorMessage error={error} />

  return (
    <Wrapper noPad>
      <h2>History</h2>
      {!data.length && (
        <p className="secondary">
          Videos that you have watched will show up here
        </p>
      )}
      {data.map((video) => (
        <TrendingCard key={video.id} video={video} />
      ))}
    </Wrapper>
  );
}

export default History;

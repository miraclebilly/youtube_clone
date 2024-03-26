import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "../components/ErrorMessage";
import TrendingCard from "../components/TrendingCard";
import Skeleton from "../skeletons/TrendingSkeleton";
import Wrapper from "../styles/Trending";
import { getTrendingVideos } from "../utils/supabase";

function TrendingPage() {
  const { isLoading, isError, error, data: videos } = useQuery(['Home'], getTrendingVideos);  
  return (
    <Wrapper>
      <h2>Trending</h2>
      <div className="trending">
        {videos.map(video => (<TrendingCard key={video.id} video={video} />))}
      </div>
    </Wrapper>
  );
}

export default TrendingPage;

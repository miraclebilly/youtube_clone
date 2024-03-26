import { useQuery } from "@tanstack/react-query";
import ChannelSuggestions from "../components/ChannelSuggestions";
import ErrorMessage from "../components/ErrorMessage";
import { SubIcon } from "../components/Icons";
import SignUpCard from "../components/SignUpCard";
import VideoCard from "../components/VideoCard";
import useCurrentProfile from "../hooks/useCurrentProfile";
import Skeleton from "../skeletons/HomeSkeleton";
import Wrapper from "../styles/Home";
import VideoGrid from "../styles/VideoGrid";
import { getSubscriptionVideos } from "../utils/supabase";

function Subscriptions() {
  const profile = useCurrentProfile();
  const profileId = profile?.id ;
  const profileSubs = profile?.subscriptions;
  const {isLoading, isError, error, data} = useQuery(
    ["Subscriptions", profileId],
    () => getSubscriptionVideos(profileSubs),
    {
      enabled: !!profile,
    }
  )

  if(!profile) {
    return (
      <SignUpCard 
        icon={<SubIcon />}
        title= "Don't miss new videos"
        description="Sign in to see updates from your favourite Youtube channels"
      />
    )
  }
  if (isLoading) return <Skeleton />
  if (isError) return <ErrorMessage error={error} />
  if (!isLoading && !data.length) return <ChannelSuggestions /> 

  return (
    <Wrapper>
      <div style={{ marginTop: "1.5rem" }} />
      <VideoGrid>
        {data.map(video => (
          <VideoCard key={video.id} video={video} hideAvatar />
        ))}
      </VideoGrid>
    </Wrapper>
  );
}

export default Subscriptions;

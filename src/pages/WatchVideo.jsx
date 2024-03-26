import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import CommentList from "../components/AddComment";
import { DislikeIcon, LikeIcon } from "../components/Icons";
import NoResults from "../components/NoResults";
import SubscribeButton from "../components/SubscribeButton";
import VideoCard from "../components/VideoCard";
import VideoPlayer from "../components/VideoPlayer";
import useCurrentProfile from "../hooks/useCurrentProfile";
import Skeleton from "../skeletons/WatchVideoSkeleton";
import Wrapper from "../styles/WatchVideo";
import { formatCreatedAt } from "../utils/date";
import {
  dislikeVideo,
  getVideo,
  getVideoLikes,
  getVideos,
  likeVideo,
  signInWithGoogle,
} from "../utils/supabase";
import videojs from "video.js";

function WatchVideoPage() {
  const { videoId } = useParams()
  const profile = useCurrentProfile();
  const profileId = profile?.id;
  const { isLoading: isLoadingVideo, data: video } = useQuery(['WatchVideo', videoId], 
        () => getVideo(videoId))
  const { isLoading: isLoadingLikes, data: likes } = useQuery(
        ['WatchVideo', 'Likes', videoId, profileId], 
        () => getVideoLikes(videoId, profileId))

  const { isLoading: isLoadingVideos, data: videos } = useQuery(
        ['WatchVideo', 'Up Next'], 
        getVideos
  )

  function handleLikeVideo() {
    if (!profile) {
      signInWithGoogle()
    } else {
      likeVideo(profile, videoId)
    }
  }

  function handleDislikeVideo() {
    if (!profile) {
      signInWithGoogle()
    } else {
      dislikeVideo(profile, videoId)
    }
  }

  if (isLoadingVideo || isLoadingLikes || isLoadingVideos) return <Skeleton />
  if (!video) {
    return (
      <NoResults title="Page not found" text="The page your are looking for is not found
      or may have been removed"/>
    )
  }

  const isVideoMine = video.profile.id === profileId;

  return (
    <Wrapper filledLike={likes.isLiked} filledDislike={likes.isDisliked}>
      <div className="video-container">
        <div className="video">
          {!isLoadingVideo && <VideoPlayer video={video} />}
        </div>

        <div className="video-info">
          <h3>{video.title}</h3>

          <div className="video-info-stats">
            <p>
              <span>{video.view[0].count} views</span> <span>•</span>{" "}
              <span>Published {formatCreatedAt(video.created_at)}</span>
            </p>

            <div className="likes-dislikes flex-row">
              <p className="flex-row like">
                <LikeIcon onClick={handleLikeVideo} /> <span>{likes.likeCount}</span>
              </p>
              <p className="flex-row dislike" style={{ marginLeft: "1rem" }}>
                <DislikeIcon onClick={handleDislikeVideo} /> <span>{likes.dislikeCount}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="channel-info-description">
          <div className="channel-info-flex">
            <div className="channel-info flex-row">
              <img className="avatar md" src={video.profile.avatar} alt="channel avatar" />
              <div className="channel-info-meta">
                <h4>
                  <Link to={`/channel/${video.profile_id}`}>{video.profile.username}</Link>
                </h4>
                <span className="secondary small">
                  { } subscribers
                </span>
              </div>
            </div>
            {!isVideoMine && (
              <SubscribeButton subscribedToId={video?.profile?.id} />
            )}
          </div>

          <p>{video.description}</p>
        </div>
          <CommentList video={video} />
      </div>

      <div className="related-videos">
        <h3 className="up-next">Up Next</h3>
            {videos.filter(v => v.id !== Number(videoId)).slice(0, 20).
              map(video => (
              <VideoCard key={video.id} hideAvatar video={video}/>
            ))}
      </div>
    </Wrapper>
  );
}

export default WatchVideoPage;

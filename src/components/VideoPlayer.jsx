import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import useCurrentProfile from "../hooks/useCurrentProfile";
import {useQuery} from "@tanstack/react-query"
import { addVideoView } from "../utils/supabase";

function VideoPlayer({ previewUrl, video }) {
  const profile = useCurrentProfile();
  const profileId = profile?.id;
  const videoRef = React.useRef(null)
  useQuery(['View'], () => {
    const view = {
      profile_id: profileId,
      video_id: video?.id
    }
    return addVideoView(view)
  })

  React.useEffect(() => {
    const vjsPlayer = videojs(videoRef.current); 

    if(!previewUrl) {
      vjsPlayer.poster(video.thumbnail);
      vjsPlayer.src({ type: "video/mp4", src: video.url});
    }

    if (previewUrl) {
      vjsPlayer.src({ type: "video/mp4", src: previewUrl })
    }

  }, [previewUrl, video, profileId]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} controls className="video-js vjs-fluid vjs-big-play-centered" />
    </div>
  );
}

const VideoPlayerComponent = React.memo(VideoPlayer);
VideoPlayerComponent.name = "VideoPlayerComponent";
export default VideoPlayerComponent;

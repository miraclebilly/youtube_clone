import React from "react";
import { toast } from "react-hot-toast";
import defaultAvatar from "../assets/default-avatar.png";
import useCurrentProfile from "../hooks/useCurrentProfile";
import Wrapper from "../styles/CommentList";
import { addComment } from "../utils/supabase";
import CommentList from "./CommentList";

function AddComment({ video }) {
  const profile = useCurrentProfile()
  const [text, setText] = React.useState('')

  async function handleAddComment(event) {
    if(event.keyCode === 13) {
      event.target.blur();

      if(!text.trim()) {
        return toast.error("Please write a comment");
      }

      const comment = {
        text,
        video_id: video?.id,
        profile_id: profile?.id,
      }
      await addComment(comment)
        .then(() => setText(''))
        .catch(() => toast.error("Error adding a comment"))
    }
  }

  const commentCount = video.comment?.length;

  return (
    <Wrapper>
      {commentCount === 0 && 
        <h3>Add Comment(s)</h3>}
      {commentCount > 0 && 
        <h3>{commentCount} {commentCount > 1 ? "Comments": commentCount === 1 ? "Comment": "Add Comment"}</h3>}

      <div className="add-comment">
        {profile ? (
          <img src={profile.avatar} alt={profile.username} />
        ): (<img src={defaultAvatar} alt={"default user"} />)}
        <textarea
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a public comment..."
          onKeyDown={handleAddComment}
          rows={1}
          value={text}
        />
      </div>
      <CommentList comments={video.comment} />
    </Wrapper>
  );
}

export default AddComment;

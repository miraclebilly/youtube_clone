import { createClient } from "@supabase/supabase-js";
import { queryClient } from "../components/AppProviders";
import comment from "postcss/lib/comment";
import uniqBy from "lodash.uniqby"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function signInWithGoogle() {
    supabase.auth.signInWithOAuth({ provider: "google" });
}

export async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
}

export async  function getCurrentProfile(userId) {
    const { data: profile } = await supabase
    .from('profile')
    .select("*, public_subscription_subscriber_id_fkey(subscribed_to_id)")
    .eq('user_id', userId)
    .single();
    const subscription = profile.public_subscription_subscriber_id_fkey
    const subscriptions = subscription.map((s) => s.subscribed_to_id);
    return {...profile, subscriptions};

}

export async function getVideos() {
   const { data: videos } =  await supabase
        .from("video")
        .select("*, profile(*), view(count)")
        .order("created_at", { ascending: false });
        return videos
}

export async function getLikedVideos(profileId) {
    const {data: likes} = await supabase.from("like")
        .select("*, video(*, view(count), profile(*))")
        .eq("profile_id", profileId)
    return likes.map(l => l.video)
}



export async function getTrendingVideos() {
    const { data: videos } =  await supabase
        .from("video")
        .select("*, profile(*), view(count)")
        .order("created_at", { ascending: false })
        .order("view_count", { ascending: false })
        return videos
}


export async function getSubscriptionVideos(profileSubs) {
    const {data: videos} = await supabase
        .from("video")
        .select("*, profile(*), view(count)")
        .order("created_at", { ascending: false })
        .filter("profile_id", "in", `(${profileSubs})`);
    return videos;
}

export async function getChannelSuggestions(profileId) {
    const { data } = await supabase
        .from('profile')
        .select('*, public_subscription_subscribed_to_id_fkey(count), video(count)')
        .neq('id', profileId)
        .limit(10);
    return data;
}

export async function getHistoryVideos(profileId) {
    const { data: views } = await supabase.from('view')
            .select('*, video(*, profile(*), view(count))')
            .eq('profile_id', profileId);
    return uniqBy(views.map(view => view.video), 'id')
}

export async function getVideo(videoId) {
    const {data, error} = await supabase
        .from('video')
        .select(
            "*, profile(*, public_subscription_subscriber_id_fkey(count)), view(count), like(profile_id, type), comment(*, profile(*))")
        .eq("id", videoId)
        .order("created_at", { foreignTable: "comment", ascending: false })
        .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    
}

export async function getVideoLikes(videoId, profileId) {
    const { data } = await supabase
        .from('video')
        .select('like(profile_id, type)')
        .eq("id", videoId)
        .single();
    const likes = data.like.filter(l => l.type === 'like')
    const dislikes = data.like.filter(l => l.type === 'dislike')
    const likeCount = likes.length
    const dislikeCount = dislikes.length
    const isLiked = likes.some(l => l.profile_id === profileId)
    const isDisliked = dislikes.some(l => l.profile_id === profileId)
    return { likeCount, dislikeCount, isLiked, isDisliked }

}

export async function addVideo(video) {
    await supabase.from("video").insert([video]);
}

export async function getChannel(profileId) {
    const { data } = await supabase.from('profile')
        .select('*, video(*, view(count)), public_subscription_subscriber_id_fkey(*, profile!public_subscription_subscribed_to_id_fkey(*)), public_subscription_subscribed_to_id_fkey(*,profile!public_subscription_subscribed_to_id_fkey(*))'
    ) 
    .eq("id", profileId)
    .single();
    const subscribers = data.public_subscription_subscriber_id_fkey;
    const subscriptions = data.public_subscription_subscribed_to_id_fkey;
    const subscriberCount = subscriptions.length;
    delete data.public_subscription_subscriber_id_fkey;
    delete data.public_subscription_subscribed_to_id_fkey;
    return { ...data, subscriptions, subscribers, subscriberCount };
}

export async function addVideoView(view) {
    return await supabase.from('view').insert([view])
}

export async function addComment(comment) {
    await supabase.from('comment').insert([comment])
    await queryClient.invalidateQueries(["WatchVideo"])
}

export async function searchVideosAndProfiles(searchQuery) {
    const { data: videos } = await supabase
        .from('video')
        .select("*, profile(*), view(count)")
        .ilike("title", `%${searchQuery}%`);
    const { data: profiles } =  await supabase.from('profile')
            .select('*, public_subscription_subscribed_to_id_fkey(count), video(count)')
            .ilike('username', `%${searchQuery}%`);
        return {videos, profiles}
}

export async function likeVideo(profile, videoId) {
    const { data: likes } = await supabase.from("like")
        .select("id, profile_id, type")
        .eq("profile_id", profile.id)
        .eq("video_id", videoId)
    const like = likes[0];
    const isLiked = like && like.type === "like";
    const isDisliked = like && like.type === "dislike";

    if (isLiked) {
        // delete like
        await supabase.from('like').delete().eq('id', like.id)
    } else if (isDisliked) {
        //change to like
        await supabase.from('like').update({ type: 'dislike' }).eq('id', like.id)
    }else {
        // add like
        await supabase.from('like').insert([
            {
               profile_id: profile.id,
               video_id: videoId,
               user_id: profile.user_id,
               type: "like",
            },
        ]);
    }
    await queryClient.invalidateQueries(["WatchVideo", "Likes"]);
}

export async function dislikeVideo(profile, videoId) {
    const { data: likes } = await supabase.from("like")
    .select("id, profile_id, type")
    .eq("profile_id", profile.id)
    .eq("video_id", videoId)
const like = likes[0];
const isLiked = like && like.type === "like";
const isDisliked = like && like.type === "dislike";

if (isDisliked) {
    // delete like
    await supabase.from('like').delete().eq('id', like.id)
} else if (isLiked) {
    //change to like
    await supabase.from('like').update({ type: 'like' }).eq('id', like.id)
}else {
    // add dislike
    await supabase.from('like').insert([
        {
           profile_id: profile.id,
           video_id: videoId,
           user_id: profile.user_id,
           type: "dislike",
        },
    ]);
}
await queryClient.invalidateQueries(["WatchVideo", "Likes"]);
}

export async function toggleSubscribeUser(profile, subscribedToId) {
    const { data } = await supabase.from('subscription').select('*')
        .eq("subscriber_id", profile.id).eq('subscribed_to_id', subscribedToId).single();
    if(data) {
        await supabase.from('subscription').delete().eq("subscriber_id", profile.id)
                      .eq("subscribed_to_id", subscribedToId)
    } else {
        const subscription = {
            subscriber_id: profile.id,
            subscribed_to_id: subscribedToId,
            user_id: profile.user_id
        }
        await supabase.from('subscription').insert([subscription])
    }
    await queryClient.invalidateQueries(["WatchVideo"]);
    await queryClient.invalidateQueries(["Channel"]);
    await queryClient.invalidateQueries(["Channels"]);
    await queryClient.invalidateQueries(["Subscriptions"]);
    await queryClient.invalidateQueries(["SearchResults"]);
}

export async function uploadImage(file) {
    await supabase.storage.from('images').upload(file.name, file)
    const { data } = await supabase.storage.from('images').getPublicUrl(file.name)
    return data.publicUrl
}

export async function updateProfile(profile) {
    await supabase.from("profile").update(profile).eq("id", profile.id);
    await queryClient.invalidateQueries(["Channel"])
}

export async function deleteVideo(videoId) {
    await supabase.from('video').delete().eq('id', videoId)
    await queryClient.invalidateQueries(["Channel"])
}

export function deleteComment() {}

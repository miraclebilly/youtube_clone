import useCurrentProfile from "../hooks/useCurrentProfile";
import Button from "../styles/Button";
import { toggleSubscribeUser } from "../utils/supabase";

function SubscribeButton({ subscribedToId }) {
  const profile = useCurrentProfile();
  const isSubscribed = profile?.subscriptions.includes(subscribedToId);


  return (
  <Button onClick={() => toggleSubscribeUser(profile, subscribedToId)} grey={isSubscribed}>
    {isSubscribed ? "Subscribed" : "Subscribe"}
  </Button>
  )
}

export default SubscribeButton;

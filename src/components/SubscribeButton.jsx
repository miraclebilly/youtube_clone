import { toast } from 'react-hot-toast'
import useCurrentProfile from "../hooks/useCurrentProfile";
import Button from "../styles/Button";
import { toggleSubscribeUser } from "../utils/supabase";

function SubscribeButton({ subscribedToId }) {
  const profile = useCurrentProfile();
  const isSubscribed = profile?.subscriptions.includes(subscribedToId);

  const handleClick = () => {
    if(!profile){
      toast.error("Sign in to Subscribe to a Channel")
      
    } else {
      toggleSubscribeUser(profile, subscribedToId)
    }
  }


  return (
    
  <Button onClick={handleClick} grey={isSubscribed}>
    {isSubscribed ? "Subscribed" : "Subscribe"}
  </Button>
  )
}

export default SubscribeButton;

import React from 'react'
import { supabase, getCurrentProfile } from '../utils/supabase';

export const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
 
  const [profile, setProfile] = React.useState(null)

  React.useEffect(() => {
    supabase.auth.getSession().then(async ({data}) => {
      if (data.session){
        const user = data.session.user
        const profile = await getCurrentProfile(user.id)
        setProfile({...profile, user})
      }
    })

    supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        const user = session.user
        const profile = await getCurrentProfile(user.id)
        setProfile({ ...profile, user })
      }
      
    })
  }, [])
  return (
    <AuthContext.Provider value={profile}>
      {children}
    </AuthContext.Provider>
  )
}

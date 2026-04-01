import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user && localStorage.getItem('terms_pending_accept')) {
        localStorage.removeItem('terms_pending_accept')
        supabase.from('users').update({ terms_accepted_at: new Date().toISOString() }).eq('id', session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    // Limpar cache de plano e dados do usuário anterior
    sessionStorage.clear()
    // Limpar chaves específicas do localStorage relacionadas ao ContentFlow
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith('cf_') || key.startsWith('contentflow_') || key.startsWith('sb-')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))

    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  userProfile: {
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  } | null;
}
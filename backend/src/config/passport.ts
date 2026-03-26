import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL ?? 'http://localhost:4000'}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = {
            id: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value ?? '',
            avatar: profile.photos?.[0]?.value ?? undefined,
            plan: 'free' as const,
            aiTokensLeft: 20,
          }
          return done(null, user)
        } catch (err) {
          return done(err as Error)
        }
      }
    )
  )
} else {
  console.warn('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it')
}

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user as Express.User))

export default passport

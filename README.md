<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/43cc515a-c570-4d41-98d2-7af94c447d9c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Create a Supabase project, then copy its project URL and anon key into `.env.local`:
   `VITE_SUPABASE_URL=https://your-project.supabase.co`
   `VITE_SUPABASE_ANON_KEY=your-anon-key`
4. In the Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql) to create profiles, shops, ownership policies, and the new-user profile trigger.
5. In Supabase Authentication settings, choose whether email confirmation is required for new accounts.
6. Run the app:
   `npm run dev`

The app now opens on a Supabase email login/sign-up screen. Authenticated users can use the existing marketplace and seller OS, and newly created storefronts are also written to the `businesses` table with the signed-in user as `seller_id`.

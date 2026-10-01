# Temporarily disable email confirmation

The app signs users up through Supabase Auth (`supabase.auth.signUp`). It does not send or verify confirmation emails through a separate provider, and there are no other auth providers in this repository.

For the hosted Supabase project, an owner can temporarily turn off **Confirm email** in the project's Auth email provider settings. With confirmation disabled, Supabase returns a session at signup and allows the user to sign in without following an email link. Supabase treats the email address as confirmed when this setting is off, so use this only while email confirmation is not required.

The same hosted setting can be changed with the Supabase Management API by patching `/v1/projects/{project_ref}/config/auth` with:

```json
{"mailer_autoconfirm": true}
```

This requires a Supabase Personal Access Token with auth configuration write access. Keep that token server-side and out of the app bundle, `.env.example`, and source control. The app's public Supabase client cannot change project Auth settings. There are no email verification calls to remove from other APIs in this repository.

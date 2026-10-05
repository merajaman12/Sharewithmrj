# Lecture Drop

A simple public upload/download page for transferring lecture files between a laptop and phone.

## Setup

1. Create a Supabase project.
2. In **Storage**, create a bucket named `lecture-files`.
3. Make the bucket **Public**.
4. Add storage policies that allow anonymous users to:
   - INSERT into `lecture-files`
   - SELECT from `lecture-files`
5. Copy `config.example.js` to `config.js`.
6. Put your Supabase project URL and **public anon key** in `config.js`.
7. Upload all files in this folder to a GitHub repository.
8. Enable GitHub Pages for the repository.

### Important

The anon key is intended for browser use. Never put a Supabase `service_role`/secret key in this website.

Because anonymous uploads are enabled, anyone who knows the URL can upload files. The front end limits files to 50 MB and common document/image/archive types, but production use should add stronger server-side quotas/rate limits.

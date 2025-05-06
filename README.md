# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dafc79e7-9138-4a18-acaf-3f6f0ed54103

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dafc79e7-9138-4a18-acaf-3f6f0ed54103) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up your environment variables.
# Copy the .env.example file to .env and update with your Supabase credentials
cp .env.example .env

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for database and authentication)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dafc79e7-9138-4a18-acaf-3f6f0ed54103) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Supabase Integration

This project uses Supabase for database storage. To set up your own Supabase instance:

1. Create an account at [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and anon key from the API settings
4. Add these to your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The database schema includes the following tables:
- `categories`: For storing product categories
- `products`: For storing product information

The application will automatically connect to your Supabase instance and use these tables for data storage.

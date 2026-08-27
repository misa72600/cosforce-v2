export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <p className="mb-3 text-sm text-neutral-400">
          Development Environment
        </p>

        <h1 className="mb-10 text-5xl font-bold">
          CosForce 2.0
        </h1>

        <div className="space-y-3 text-lg">
          <p>✅ Next.js</p>
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Local Development</p>
          <p>⬜ GitHub</p>
          <p>⬜ Cloudflare</p>
          <p>⬜ Database</p>
          <p>⬜ Authentication</p>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-sm text-neutral-500">
          CosForce Web Platform · Version 2.0
        </div>
      </div>
    </main>
  );
}
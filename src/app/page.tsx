import { container } from "@/infrastructure/di/container";
import { UserList } from "@/presentation/components/UserList";

export default async function Home() {
  const userService = container.cradle.userService;
  const usersResponse = await userService.getUsers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Next.js Clean Architecture
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Users ({usersResponse.total})
            </h2>
            <UserList users={usersResponse.data} />
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Project Features:
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>Next.js 16 with App Router & Turbopack</li>
              <li>TypeScript</li>
              <li>Tailwind CSS v4</li>
              <li>Clean Architecture</li>
              <li>Dependency Injection with Awilix</li>
              <li>TDD with Jest & React Testing Library</li>
              <li>PostgreSQL with Prisma ORM</li>
              <li>JWT Authentication</li>
              <li>Swagger/OpenAPI Documentation</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/docs"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
              >
                📖 ReDoc Documentation
              </a>
              <a
                href="https://editor.swagger.io/?url=http://localhost:3000/api/docs"
                target="_blank"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                📝 Swagger Editor
              </a>
              <a
                href="https://petstore.swagger.io/?url=http://localhost:3000/api/docs"
                target="_blank"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                📚 Swagger UI
              </a>
              <a
                href="/api/docs"
                target="_blank"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                🔧 OpenAPI JSON
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

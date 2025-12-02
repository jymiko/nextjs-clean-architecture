import { container } from "@/infrastructure/di/container";
import { UserList } from "@/presentation/components/UserList";

export default async function Home() {
  const userService = container.cradle.userService;
  const users = await userService.getUsers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Next.js Clean Architecture
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Users
            </h2>
            <UserList users={users} />
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Project Features:
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>Next.js 16 with App Router</li>
              <li>TypeScript</li>
              <li>Tailwind CSS v4</li>
              <li>Clean Architecture</li>
              <li>Dependency Injection with Awilix</li>
              <li>TDD with Jest & React Testing Library</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

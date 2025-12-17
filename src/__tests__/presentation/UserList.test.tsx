import { render, screen } from "@testing-library/react";
import { UserList } from "@/presentation/components/UserList";
import { User, UserRole } from "@/domain/entities/User";

describe("UserList", () => {
  const mockUsers: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: UserRole.USER, isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() },
    { id: "2", name: "Jane Doe", email: "jane@example.com", role: UserRole.ADMIN, isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() },
  ];

  it("should render list of users", () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("should render empty state when no users", () => {
    render(<UserList users={[]} />);

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });
});

/**
 * UI Component Tests
 * Tests rendering, interactions, and accessibility of key UI components.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ── Badge Component ───────────────────────────────────────────────────────────
describe("Badge component", () => {
  it("renders with default variant", () => {
    render(<Badge>Pending</Badge>);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders success variant for approved status", () => {
    const { container } = render(<Badge variant="success">Approved</Badge>);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-green-100", "text-green-800");
  });

  it("renders destructive variant for rejected status", () => {
    const { container } = render(<Badge variant="destructive">Rejected</Badge>);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-destructive");
  });

  it("renders warning variant for pending status", () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    expect(container.firstChild).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("applies additional classNames", () => {
    const { container } = render(<Badge className="custom-class">Label</Badge>);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

// ── Button Component ──────────────────────────────────────────────────────────
describe("Button component", () => {
  it("renders with label text", () => {
    render(<Button>Submit Request</Button>);
    expect(screen.getByRole("button", { name: "Submit Request" })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders destructive variant", () => {
    const { container } = render(<Button variant="destructive">Reject</Button>);
    expect(container.firstChild).toHaveClass("bg-destructive");
  });

  it("renders outline variant", () => {
    const { container } = render(<Button variant="outline">Cancel</Button>);
    expect(container.firstChild).toHaveClass("border");
  });

  it("renders small size", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass("h-9");
  });

  it("is disabled and shows correct attribute", () => {
    render(<Button disabled>Loading...</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

// ── Input Component ───────────────────────────────────────────────────────────
describe("Input component", () => {
  it("renders with placeholder text", () => {
    render(<Input placeholder="Enter quantity" />);
    expect(screen.getByPlaceholderText("Enter quantity")).toBeInTheDocument();
  });

  it("accepts typed input", () => {
    render(<Input placeholder="quantity" />);
    const input = screen.getByPlaceholderText("quantity") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5" } });
    expect(input.value).toBe("5");
  });

  it("renders number type correctly", () => {
    render(<Input type="number" placeholder="qty" />);
    expect(screen.getByPlaceholderText("qty")).toHaveAttribute("type", "number");
  });

  it("renders password type correctly", () => {
    render(<Input type="password" placeholder="password" />);
    expect(screen.getByPlaceholderText("password")).toHaveAttribute("type", "password");
  });

  it("is disabled when disabled prop passed", () => {
    render(<Input disabled placeholder="disabled" />);
    expect(screen.getByPlaceholderText("disabled")).toBeDisabled();
  });
});

// ── Card Component ────────────────────────────────────────────────────────────
describe("Card component", () => {
  it("renders card with title and content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p>50 items available</p>
        </CardContent>
      </Card>
    );
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("50 items available")).toBeInTheDocument();
  });

  it("renders card with custom className", () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    expect(container.firstChild).toHaveClass("custom-card");
  });
});

// ── StatusBadge Logic Tests ───────────────────────────────────────────────────
describe("Status display logic", () => {
  function StatusBadge({ status }: { status: string }) {
    if (status === "APPROVED") return <Badge variant="success">Approved</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  }

  it("shows Approved badge for APPROVED status", () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows Rejected badge for REJECTED status", () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("shows Pending badge for PENDING status", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("defaults to Pending for unknown status", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});

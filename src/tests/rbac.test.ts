/**
 * Role-Based Access Control Tests
 * Tests middleware route-guard logic by simulating requests with different auth states.
 */
import { describe, it, expect, vi } from "vitest";

// ── RBAC Logic (extracted from proxy.ts for unit testing) ─────────────────────
type Role = "ADMIN" | "EMPLOYEE";

interface MockSession {
  user: { id: string; role: Role; name: string; email: string };
}

function getRedirect(
  pathname: string,
  session: MockSession | null
): { action: "next" | "redirect"; destination?: string } {
  if (pathname === "/login") {
    if (session) {
      const dest = session.user.role === "ADMIN" ? "/admin/requests" : "/employee/requests";
      return { action: "redirect", destination: dest };
    }
    return { action: "next" };
  }

  if (!session) {
    return { action: "redirect", destination: "/login" };
  }

  const role = session.user.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return { action: "redirect", destination: "/employee/requests" };
  }

  if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
    return { action: "redirect", destination: "/admin/requests" };
  }

  return { action: "next" };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────
const adminSession: MockSession = {
  user: { id: "admin-1", role: "ADMIN", name: "Admin User", email: "admin@company.com" },
};

const employeeSession: MockSession = {
  user: { id: "emp-1", role: "EMPLOYEE", name: "John Employee", email: "employee@company.com" },
};

// ── Unauthenticated Access ─────────────────────────────────────────────────────
describe("RBAC — Unauthenticated access", () => {
  it("allows unauthenticated user to access /login", () => {
    const result = getRedirect("/login", null);
    expect(result.action).toBe("next");
  });

  it("redirects unauthenticated user from /employee/requests to /login", () => {
    const result = getRedirect("/employee/requests", null);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/login");
  });

  it("redirects unauthenticated user from /admin/requests to /login", () => {
    const result = getRedirect("/admin/requests", null);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/login");
  });

  it("redirects unauthenticated user from /admin/inventory to /login", () => {
    const result = getRedirect("/admin/inventory", null);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/login");
  });

  it("redirects unauthenticated user from / to /login", () => {
    const result = getRedirect("/", null);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/login");
  });
});

// ── Admin Role Access ─────────────────────────────────────────────────────────
describe("RBAC — Admin role", () => {
  it("redirects admin away from /login to /admin/requests", () => {
    const result = getRedirect("/login", adminSession);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/admin/requests");
  });

  it("allows admin to access /admin/requests", () => {
    const result = getRedirect("/admin/requests", adminSession);
    expect(result.action).toBe("next");
  });

  it("allows admin to access /admin/inventory", () => {
    const result = getRedirect("/admin/inventory", adminSession);
    expect(result.action).toBe("next");
  });

  it("blocks admin from accessing /employee/requests → redirects to /admin/requests", () => {
    const result = getRedirect("/employee/requests", adminSession);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/admin/requests");
  });

  it("allows admin to access any /admin/* sub-path", () => {
    const result = getRedirect("/admin/some/nested/path", adminSession);
    expect(result.action).toBe("next");
  });
});

// ── Employee Role Access ──────────────────────────────────────────────────────
describe("RBAC — Employee role", () => {
  it("redirects employee away from /login to /employee/requests", () => {
    const result = getRedirect("/login", employeeSession);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/employee/requests");
  });

  it("allows employee to access /employee/requests", () => {
    const result = getRedirect("/employee/requests", employeeSession);
    expect(result.action).toBe("next");
  });

  it("blocks employee from accessing /admin/requests → redirects to /employee/requests", () => {
    const result = getRedirect("/admin/requests", employeeSession);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/employee/requests");
  });

  it("blocks employee from accessing /admin/inventory → redirects to /employee/requests", () => {
    const result = getRedirect("/admin/inventory", employeeSession);
    expect(result.action).toBe("redirect");
    expect(result.destination).toBe("/employee/requests");
  });

  it("allows employee to access any /employee/* sub-path", () => {
    const result = getRedirect("/employee/history", employeeSession);
    expect(result.action).toBe("next");
  });
});

// ── Cross-Role Boundary ───────────────────────────────────────────────────────
describe("RBAC — Cross-role boundary", () => {
  it("admin cannot access any employee route", () => {
    const routes = ["/employee/requests", "/employee/history", "/employee/profile"];
    routes.forEach((route) => {
      const result = getRedirect(route, adminSession);
      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/admin/requests");
    });
  });

  it("employee cannot access any admin route", () => {
    const routes = ["/admin/requests", "/admin/inventory", "/admin/settings"];
    routes.forEach((route) => {
      const result = getRedirect(route, employeeSession);
      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/employee/requests");
    });
  });
});

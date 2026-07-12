import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="container flex min-h-[70vh] max-w-md items-center py-10">
      <div className="w-full">
        <LoginForm />
      </div>
    </div>
  );
}

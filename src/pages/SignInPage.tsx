import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { LockIcon, MailIcon } from "../components/ui/icons";
import { supabase } from "../utils/supabase";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data) {
        toast.success("Signed in successfully");
        navigate("/");
      } else {
        toast.error((error as Error).message || "Something went wrong");
      }
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your feed."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-accent hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<MailIcon />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            icon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line accent-accent"
              />
              Remember me
            </label>
            <a href="#" className="font-medium text-accent hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="accent"
          fullWidth
          disabled={!isFormValid}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

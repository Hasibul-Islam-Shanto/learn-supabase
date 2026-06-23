import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/shared/ui/Button';
import TextField from '@/shared/ui/TextField';
import { LockIcon, MailIcon } from '@/shared/ui/icons';
import { supabase } from '@/shared/lib/supabase';
import AuthLayout from '../components/AuthLayout';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (!error && data) {
        toast.success('Account created successfully');
        navigate('/signin');
      } else {
        toast.error((error as Error).message || 'Something went wrong');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0 && isAgreed;
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Meet and start sharing in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-semibold text-accent hover:underline"
          >
            Sign in
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
        <TextField
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-line accent-accent"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <span>
            I agree to the{' '}
            <a href="#" className="font-medium text-accent hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-accent hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button
          type="submit"
          variant="accent"
          fullWidth
          disabled={!isFormValid}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}

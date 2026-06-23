import type { Metadata } from 'next';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { RegisterStaffForm } from '@/components/features/auth/register-staff-form';

export const metadata: Metadata = {
  title: 'Registro de Staff · FWD Costa Rica',
};

export default function RegisterStaffPage() {
  return (
    <AuthShell highlight="operaciones FWD">
      <RegisterStaffForm />
    </AuthShell>
  );
}

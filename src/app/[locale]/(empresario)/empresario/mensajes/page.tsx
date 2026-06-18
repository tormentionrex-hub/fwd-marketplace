import type { Metadata } from 'next';
import ChatView from '@/components/features/chat/ChatView';

export const metadata: Metadata = {
  title: 'Mensajes · FWD Marketplace',
};

export default function MensajesEmpresarioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <ChatView />
    </div>
  );
}

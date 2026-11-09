import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { Button, ErrorMessage } from '@/components/ui';
import { usePaymentIntent } from '@/hooks/queries';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';

/** Hosted checkout page of the simulated payment provider. */
export function FakeCheckoutPage() {
  const { intentId = '' } = useParams();
  const intent = usePaymentIntent(intentId);
  const action = useMutation({
    mutationFn: (kind: 'confirm' | 'decline') =>
      kind === 'confirm' ? api.confirmPayment(intentId) : api.declinePayment(intentId),
    onSuccess: (result) => window.location.assign(result.redirectUrl),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-950 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p className="mb-6 text-sm font-semibold tracking-wide text-indigo-700">FakePay · test mode</p>
        {intent.isPending && <p className="text-slate-500">Loading…</p>}
        <ErrorMessage error={intent.error} />
        {intent.data && (
          <>
            <p className="text-sm text-slate-500">Pay Munch Market</p>
            <p className="mb-6 text-3xl font-bold">{formatPrice(intent.data.amount)}</p>
            <div className="mb-6 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
              <p>Card: 4242 4242 4242 4242</p>
              <p>Expiry 12/34 · CVC 123</p>
            </div>
            {intent.data.status === 'requires_payment' ? (
              <div className="space-y-2">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={action.isPending}
                  onClick={() => action.mutate('confirm')}
                >
                  Pay
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={action.isPending}
                  onClick={() => action.mutate('decline')}
                >
                  Decline
                </Button>
                <ErrorMessage error={action.error} />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p>
                  This payment has already been{' '}
                  {intent.data.status === 'succeeded' ? 'completed' : 'declined'}.
                </p>
                <a href={intent.data.returnUrl} className="font-medium text-indigo-700 underline">
                  Return to Munch Market
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

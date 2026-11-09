import { Badge, Button, Card, ErrorMessage, PageTitle } from '@/components/ui';
import { useFulfilmentTasks, useMarkTask } from '@/hooks/queries';
import { CARRIER_LABELS, formatDate, shortId } from '@/lib/format';

export function PickingPage() {
  const tasks = useFulfilmentTasks();
  const markTask = useMarkTask();

  return (
    <div>
      <PageTitle>Picking list</PageTitle>
      <ErrorMessage error={tasks.error ?? markTask.error} />
      {tasks.isPending ? (
        <p className="text-slate-500">Loading…</p>
      ) : tasks.data?.length === 0 ? (
        <p className="text-slate-500">Nothing to pick right now.</p>
      ) : (
        <div className="space-y-4">
          {tasks.data?.map((task) => (
            <Card key={task.id} className="p-4" data-testid="picking-task">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="font-semibold">Order #{shortId(task.orderId)}</h2>
                <Badge tone={task.status === 'open' ? 'amber' : 'blue'}>
                  {task.status === 'open' ? 'To pick' : 'Picked'}
                </Badge>
                <span className="text-sm text-slate-500">
                  {CARRIER_LABELS[task.order.carrier]} · created {formatDate(task.createdAt)}
                </span>
                <div className="ml-auto">
                  {task.status === 'open' ? (
                    <Button
                      disabled={markTask.isPending}
                      onClick={() => markTask.mutate({ id: task.id, status: 'picked' })}
                    >
                      Mark picked
                    </Button>
                  ) : (
                    <Button
                      disabled={markTask.isPending}
                      onClick={() => markTask.mutate({ id: task.id, status: 'shipped' })}
                    >
                      Mark shipped
                    </Button>
                  )}
                </div>
              </div>
              <p className="mb-2 text-sm text-slate-600">
                Ship to {task.order.shippingAddress.name}, {task.order.shippingAddress.zip}{' '}
                {task.order.shippingAddress.city}
              </p>
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-1 font-medium">SKU</th>
                    <th className="py-1 font-medium">Product</th>
                    <th className="py-1 text-right font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {task.order.lines.map((line) => (
                    <tr key={line.id} className="border-t border-slate-100">
                      <td className="py-1 font-mono text-xs">{line.product.sku}</td>
                      <td className="py-1">
                        {line.product.name} <span className="text-slate-500">({line.product.unitLabel})</span>
                      </td>
                      <td className="py-1 text-right font-medium">{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

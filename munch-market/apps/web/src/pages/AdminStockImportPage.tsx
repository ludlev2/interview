import { useState, type FormEvent } from 'react';
import { Button, Card, ErrorMessage, Label, PageTitle, Textarea } from '@/components/ui';
import { useImportStock } from '@/hooks/queries';

const EXAMPLE = `sku,batchCode,bestBefore,quantity
SNK-001,L2611A,2027-03-31,48
DRK-004,L2611B,2027-01-15,24`;

export function AdminStockImportPage() {
  const [csv, setCsv] = useState('');
  const importStock = useImportStock();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    importStock.mutate(csv);
  }

  return (
    <div className="max-w-3xl">
      <PageTitle>Stock import</PageTitle>
      <Card className="space-y-4 p-4">
        <p className="text-sm text-slate-600">
          Paste the supplier delivery note as CSV with the columns{' '}
          <code className="rounded bg-slate-100 px-1">sku,batchCode,bestBefore,quantity</code>.
          Dates use the format YYYY-MM-DD.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="csv">CSV</Label>
            <Textarea
              id="csv"
              rows={12}
              placeholder={EXAMPLE}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
          </div>
          <ErrorMessage error={importStock.error} />
          <Button type="submit" disabled={!csv.trim() || importStock.isPending}>
            {importStock.isPending ? 'Importing…' : 'Import'}
          </Button>
        </form>
      </Card>
      {importStock.data && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
          <p className="font-medium">Import complete</p>
          <p>
            {importStock.data.rows} rows imported, {importStock.data.unitsAdded} units added across{' '}
            {importStock.data.products.length} products ({importStock.data.products.join(', ')}).
          </p>
        </div>
      )}
    </div>
  );
}

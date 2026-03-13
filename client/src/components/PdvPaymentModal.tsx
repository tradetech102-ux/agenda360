import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PdvPaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
  isLoading?: boolean;
}

export interface PaymentData {
  paymentMethod: 'cash' | 'debit' | 'credit' | 'pix' | 'bread' | 'check' | 'mixed';
  amountPaid: number;
  change: number;
  pixAccount?: string;
  clientId?: number;
  sellerId?: number;
  notes?: string;
}

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export const PdvPaymentModal: React.FC<PdvPaymentModalProps> = ({
  total,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'credit' | 'pix' | 'bread' | 'check' | 'mixed'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(total);
  const [notes, setNotes] = useState('');
  const [pixAccount, setPixAccount] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Query clients
  const { data: allClients = [] } = trpc.clients.list.useQuery();

  const change = amountPaid - total;

  // Filter clients based on search
  const filteredClients = useCallback(() => {
    if (!clientSearch.trim()) return [];
    return (allClients as any[]).filter(client => {
      const searchLower = clientSearch.toLowerCase();
      return (
        (client.name && client.name.toLowerCase().includes(searchLower)) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.phone && client.phone.includes(clientSearch))
      );
    });
  }, [clientSearch, allClients]);

  const handleSelectClient = (client: any) => {
    setSelectedClient({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    });
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleConfirm = () => {
    if (amountPaid < total && paymentMethod === 'cash') {
      alert('O valor pago deve ser maior ou igual ao total!');
      return;
    }

    if (paymentMethod === 'pix' && !pixAccount) {
      alert('Selecione uma conta PIX!');
      return;
    }

    onConfirm({
      paymentMethod,
      amountPaid,
      change: Math.max(0, change),
      pixAccount: paymentMethod === 'pix' ? pixAccount : undefined,
      clientId: selectedClient?.id,
      notes: notes || undefined,
    });
  };

  const clientResults = filteredClients();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold text-foreground">Finalizar Venda</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Total Display */}
          <div className="bg-muted p-3 rounded">
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-2xl font-bold text-foreground">R$ {total.toFixed(2)}</p>
          </div>

          {/* Client Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cliente (opcional)</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                    if (!e.target.value) {
                      setSelectedClient(null);
                    }
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  className="pl-10"
                />
                {selectedClient && (
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearch('');
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Client Dropdown */}
              {showClientDropdown && clientSearch && clientResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                  {clientResults.map(client => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border last:border-b-0"
                    >
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.phone && (
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Client Display */}
              {selectedClient && (
                <div className="mt-2 p-2 bg-muted rounded border border-border">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Cliente Selecionado:</span> {selectedClient.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value as any);
                setPixAccount('');
              }}
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
            >
              <option value="cash">Dinheiro</option>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
              <option value="pix">PIX</option>
              <option value="bread">Pão</option>
              <option value="check">Cheque</option>
              <option value="mixed">Múltiplos</option>
            </select>
          </div>

          {/* PIX Account Selection */}
          {paymentMethod === 'pix' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Selecione a Conta PIX</label>
              <select
                value={pixAccount}
                onChange={(e) => setPixAccount(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              >
                <option value="">-- Selecione uma conta --</option>
                <option value="pix_1">Conta Principal</option>
                <option value="pix_2">Conta Secundária</option>
                <option value="pix_3">Conta Terciária</option>
              </select>
            </div>
          )}

          {/* Amount Paid - Only for cash, debit, credit */}
          {['cash', 'debit', 'credit'].includes(paymentMethod) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Valor Recebido</label>
              <Input
                type="number"
                step="0.01"
                min={total}
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="text-lg font-semibold"
              />
            </div>
          )}

          {/* Change Display - Only for cash */}
          {paymentMethod === 'cash' && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">Troco</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                R$ {change.toFixed(2)}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a venda..."
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (paymentMethod === 'cash' && amountPaid < total) || (paymentMethod === 'pix' && !pixAccount)}
            className="flex-1"
          >
            {isLoading ? 'Processando...' : 'Confirmar Venda'}
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ArrowDownUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Search,
  Filter,
  Download,
  X,
  ChevronDown
} from 'lucide-react';

const typeConfig = {
  buy: { icon: CreditCard, label: 'Buy', color: 'text-green-500', bg: 'bg-green-500/10' },
  swap: { icon: ArrowDownUp, label: 'Swap', color: 'text-primary', bg: 'bg-primary/10' },
  send: { icon: ArrowUpRight, label: 'Send', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  receive: { icon: ArrowDownLeft, label: 'Receive', color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string; animate?: boolean }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-500' },
  processing: { icon: Loader2, label: 'Processing', color: 'text-blue-500', animate: true },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-500' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-500' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-muted-foreground' },
};

type TransactionType = 'buy' | 'swap' | 'send' | 'receive';
type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export default function Transactions() {
  const { transactions, loading } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          tx.tx_hash?.toLowerCase().includes(query) ||
          tx.destination_address?.toLowerCase().includes(query) ||
          tx.source_chain?.toLowerCase().includes(query) ||
          tx.source_token?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && tx.transaction_type !== typeFilter) return false;
      
      // Status filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      
      return true;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Status', 'Amount', 'Chain', 'Token', 'TX Hash'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      tx.transaction_type,
      tx.status,
      tx.destination_amount?.toString() || '',
      tx.source_chain || '',
      tx.source_token || '',
      tx.tx_hash || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          View your transaction history with real-time updates.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-3 md:p-4 mb-4 md:mb-6"
      >
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by hash, address, chain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-none outline-none text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter Toggle & Export */}
          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 flex-1 sm:flex-none text-sm"
              size="sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="gap-2 flex-1 sm:flex-none text-sm"
              size="sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-4 mt-4 border-t border-border">
                {/* Type Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Type</label>
                  <div className="flex gap-1 flex-wrap">
                    {(['all', 'buy', 'swap', 'send', 'receive'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                          typeFilter === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {type === 'all' ? 'All' : typeConfig[type].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Status</label>
                  <div className="flex gap-1 flex-wrap">
                    {(['all', 'pending', 'processing', 'completed', 'failed', 'cancelled'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                          statusFilter === status
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status === 'all' ? 'All' : statusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground self-start"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <History className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Transactions Yet</h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Your transaction history will appear here once you make your first trade.
          </p>
        </motion.div>
      ) : filteredTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-muted mb-4">
            <Search className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Results Found</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            No transactions match your current filters.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((tx, index) => {
              const type = typeConfig[tx.transaction_type];
              const status = statusConfig[tx.status];
              const TypeIcon = type.icon;
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedTransaction(tx)}
                  className="bg-card rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.bg}`}>
                        <TypeIcon className={`w-4 h-4 ${type.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{type.label}</div>
                        {tx.source_chain && (
                          <div className="text-xs text-muted-foreground">
                            {tx.source_chain} → XRP
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className={`w-3 h-3 ${status.animate ? 'animate-spin' : ''}`} />
                      {status.label}
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {tx.destination_amount?.toFixed(4)} XRP
                      </div>
                      {tx.fiat_amount && (
                        <div className="text-xs text-muted-foreground">
                          ${tx.fiat_amount.toFixed(2)} {tx.fiat_currency}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 lg:px-6 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-4 px-4 lg:px-6 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-4 px-4 lg:px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-4 lg:px-6 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-4 px-4 lg:px-6 text-sm font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => {
                    const type = typeConfig[tx.transaction_type];
                    const status = statusConfig[tx.status];
                    const TypeIcon = type.icon;
                    const StatusIcon = status.icon;
                    
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedTransaction(tx)}
                        className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${type.bg}`}>
                              <TypeIcon className={`w-4 h-4 ${type.color}`} />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{type.label}</div>
                              {tx.source_chain && (
                                <div className="text-xs text-muted-foreground">
                                  {tx.source_chain} → XRP
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="font-semibold text-foreground">
                            {tx.destination_amount?.toFixed(4)} XRP
                          </div>
                          {tx.fiat_amount && (
                            <div className="text-sm text-muted-foreground">
                              ${tx.fiat_amount.toFixed(2)} {tx.fiat_currency}
                            </div>
                          )}
                          {tx.source_amount && !tx.fiat_amount && (
                            <div className="text-sm text-muted-foreground">
                              {tx.source_amount} {tx.source_token}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${status.animate ? 'animate-spin' : ''}`} />
                            {status.label}
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6 text-muted-foreground text-sm">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-4 lg:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tx.tx_hash && (
                              <a
                                href={`https://xrpscan.com/tx/${tx.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                              >
                                View
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </DashboardLayout>
  );
}

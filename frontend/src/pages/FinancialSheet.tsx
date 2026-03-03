import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '../components/Layout/Header';
import { Modal, useModal } from '../components/ui/Modal';
import { groupService } from '../services/group.service';
import { accountService } from '../services/account.service';
import { entryService } from '../services/entry.service';
import type { Group, Entry, PaymentStatus } from '../types';
import { MONTH_LABELS } from '../types';

/** Mapa: accountId-month -> Entry */
type EntryMap = Record<string, Entry>;

function buildEntryKey(accountId: string, month: number) {
  return `${accountId}-${month}`;
}

export function FinancialSheet() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [groups, setGroups] = useState<Group[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editInstallment, setEditInstallment] = useState('');
  const [editTotalInstallments, setEditTotalInstallments] = useState('');

  const groupModal = useModal();
  const accountModal = useModal();
  const statusModal = useModal();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountGroupId, setNewAccountGroupId] = useState('');

  const entryMap: EntryMap = useMemo(() => {
    const map: EntryMap = {};
    entries.forEach((entry) => {
      map[buildEntryKey(entry.accountId, entry.month)] = entry;
    });
    return map;
  }, [entries]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [groupsData, entriesData] = await Promise.all([
        groupService.findAll(),
        entryService.findByYear(year),
      ]);
      setGroups(groupsData);
      setEntries(entriesData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveCell(accountId: string, month: number) {
    const value = parseFloat(editValue.replace(',', '.'));
    if (isNaN(value)) {
      toast.error('Valor inválido');
      return;
    }

    try {
      const existingEntry = entryMap[buildEntryKey(accountId, month)];
      const saved = await entryService.upsert({
        accountId,
        year,
        month,
        value,
        installment: editInstallment ? parseInt(editInstallment) : null,
        totalInstallments: editTotalInstallments ? parseInt(editTotalInstallments) : null,
        paymentStatus: existingEntry?.paymentStatus ?? 'PENDING',
      });

      setEntries((prev) => {
        const key = buildEntryKey(accountId, month);
        const existing = prev.findIndex((e) => buildEntryKey(e.accountId, e.month) === key);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = saved;
          return updated;
        }
        return [...prev, saved];
      });

      setEditingCell(null);
      toast.success('Salvo!');
    } catch {
      toast.error('Erro ao salvar');
    }
  }

  async function handleDeleteEntry(entryId: string) {
    try {
      await entryService.delete(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setEditingCell(null);
      toast.success('Removido!');
    } catch {
      toast.error('Erro ao remover');
    }
  }

  async function handleUpdatePaymentStatus(status: PaymentStatus) {
    if (!selectedEntry) return;
    try {
      const saved = await entryService.upsert({
        accountId: selectedEntry.accountId,
        year,
        month: selectedEntry.month,
        value: Number(selectedEntry.value),
        installment: selectedEntry.installment,
        totalInstallments: selectedEntry.totalInstallments,
        paymentStatus: status,
      });

      setEntries((prev) => {
        const key = buildEntryKey(selectedEntry.accountId, selectedEntry.month);
        const idx = prev.findIndex((e) => buildEntryKey(e.accountId, e.month) === key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return prev;
      });

      setSelectedEntry(saved);
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    try {
      await groupService.create({ name: newGroupName, order: groups.length });
      setNewGroupName('');
      groupModal.close();
      loadData();
      toast.success('Grupo criado!');
    } catch {
      toast.error('Erro ao criar grupo');
    }
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm('Deletar grupo e todas as contas associadas?')) return;
    try {
      await groupService.delete(id);
      loadData();
      toast.success('Grupo deletado!');
    } catch {
      toast.error('Erro ao deletar grupo');
    }
  }

  async function handleCreateAccount() {
    if (!newAccountName.trim() || !newAccountGroupId) return;
    try {
      await accountService.create({ name: newAccountName, groupId: newAccountGroupId });
      setNewAccountName('');
      setNewAccountGroupId('');
      accountModal.close();
      loadData();
      toast.success('Conta criada!');
    } catch {
      toast.error('Erro ao criar conta');
    }
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm('Deletar conta e todos os lançamentos?')) return;
    try {
      await accountService.delete(id);
      loadData();
      toast.success('Conta deletada!');
    } catch {
      toast.error('Erro ao deletar conta');
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function getPaymentStatusStyles(status?: PaymentStatus) {
    switch (status) {
      case 'PAID_ON_TIME':
        return { cellBg: 'bg-green-200 hover:bg-green-300', textColor: 'text-black', subColor: 'text-green-800' };
      case 'PAID_LATE':
        return { cellBg: 'bg-yellow-200 hover:bg-yellow-300', textColor: 'text-black', subColor: 'text-yellow-800' };
      default:
        return { cellBg: 'bg-white hover:bg-red-50', textColor: 'text-red-600', subColor: 'text-red-400' };
    }
  }

  function getAccountTotal(accountId: string) {
    return entries
      .filter((e) => e.accountId === accountId)
      .reduce((sum, e) => sum + Number(e.value), 0);
  }

  function getGroupTotal(group: Group) {
    return group.accounts.reduce((sum, acc) => sum + getAccountTotal(acc.id), 0);
  }

  function startEdit(accountId: string, month: number) {
    const key = buildEntryKey(accountId, month);
    const entry = entryMap[key];
    setEditingCell(key);
    setEditValue(entry ? String(Number(entry.value)) : '');
    setEditInstallment(entry?.installment ? String(entry.installment) : '');
    setEditTotalInstallments(entry?.totalInstallments ? String(entry.totalInstallments) : '');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Planilha Financeira" subtitle={`Visão mensal do ano ${year}`}>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1">
          <button onClick={() => setYear((y) => y - 1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-lg min-w-[60px] text-center">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={groupModal.open} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Grupo
          </button>
          <button onClick={accountModal.open} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={16} /> Conta
          </button>
        </div>
      </Header>

      <div className="card p-0 overflow-x-auto relative z-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 bg-slate-50 z-10 text-left px-4 py-3 font-semibold text-slate-600 min-w-[200px]">
                Grupo / Conta
              </th>
              {MONTH_LABELS.map((label, i) => (
                <th key={i} className="text-center px-3 py-3 font-semibold text-slate-600 min-w-[120px]">
                  {label}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-semibold text-slate-600 min-w-[120px] bg-slate-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <>
                <tr key={`group-${group.id}`} className="bg-primary-50 border-b border-slate-200">
                  <td className="sticky left-0 bg-primary-50 z-10 px-4 py-2.5 font-bold text-primary-900 flex items-center gap-2">
                    {group.name}
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-400 hover:text-red-600 ml-auto"
                      title="Deletar grupo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                  {MONTH_LABELS.map((_, monthIdx) => {
                    const monthTotal = group.accounts.reduce((sum, acc) => {
                      const entry = entryMap[buildEntryKey(acc.id, monthIdx + 1)];
                      return sum + (entry ? Number(entry.value) : 0);
                    }, 0);
                    return (
                      <td key={monthIdx} className="text-center px-3 py-2.5 font-semibold text-primary-700 text-xs">
                        {monthTotal > 0 ? formatCurrency(monthTotal) : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center px-4 py-2.5 font-bold text-primary-900 bg-primary-100">
                    {formatCurrency(getGroupTotal(group))}
                  </td>
                </tr>

                {group.accounts.map((account) => (
                  <tr key={`account-${account.id}`} className="group border-b border-slate-100 hover:bg-slate-50">
                    <td className="sticky left-0 bg-white z-10 px-4 py-2 pl-8 text-slate-700 flex items-center gap-2">
                      {account.name}
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-300 hover:text-red-500 ml-auto opacity-0 group-hover:opacity-100"
                        title="Deletar conta"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                    {MONTH_LABELS.map((_, monthIdx) => {
                      const month = monthIdx + 1;
                      const key = buildEntryKey(account.id, month);
                      const entry = entryMap[key];
                      const isEditing = editingCell === key;

                      return (
                        <td
                          key={monthIdx}
                          className={`text-center px-1 py-1 cursor-pointer transition-colors ${isEditing
                            ? 'bg-primary-50 ring-2 ring-primary-400 ring-inset'
                            : entry
                              ? getPaymentStatusStyles(entry.paymentStatus).cellBg
                              : 'hover:bg-blue-50'
                            }`}
                          onClick={() => {
                            if (isEditing) return;
                            if (entry) {
                              setSelectedEntry(entry);
                              statusModal.open();
                            } else {
                              startEdit(account.id, month);
                            }
                          }}
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-1 p-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full text-center text-xs border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                                placeholder="Valor"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCell(account.id, month);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                              />
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={editInstallment}
                                  onChange={(e) => setEditInstallment(e.target.value)}
                                  className="w-1/2 text-center text-xs border rounded px-1 py-0.5"
                                  placeholder="Parc"
                                />
                                <input
                                  type="text"
                                  value={editTotalInstallments}
                                  onChange={(e) => setEditTotalInstallments(e.target.value)}
                                  className="w-1/2 text-center text-xs border rounded px-1 py-0.5"
                                  placeholder="Total"
                                />
                              </div>
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleSaveCell(account.id, month)}
                                  className="text-green-600 hover:text-green-800 p-0.5"
                                  title="Salvar"
                                >
                                  <Save size={14} />
                                </button>
                                {entry && (
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-500 hover:text-red-700 p-0.5"
                                    title="Remover"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : entry ? (
                            (() => {
                              const styles = getPaymentStatusStyles(entry.paymentStatus);
                              return (
                                <div>
                                  <div className={`font-medium ${styles.textColor} text-xs`}>
                                    {formatCurrency(Number(entry.value))}
                                  </div>
                                  {entry.installment && entry.totalInstallments && (
                                    <div className={`text-[10px] ${styles.subColor}`}>
                                      {entry.installment}/{entry.totalInstallments}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center px-4 py-2 font-semibold text-slate-800 bg-slate-50 text-xs">
                      {formatCurrency(getAccountTotal(account.id))}
                    </td>
                  </tr>
                ))}
              </>
            ))}

            <tr className="bg-slate-100 border-t-2 border-slate-300">
              <td className="sticky left-0 bg-slate-100 z-10 px-4 py-3 font-bold text-slate-900">
                TOTAL GERAL
              </td>
              {MONTH_LABELS.map((_, monthIdx) => {
                const monthTotal = entries
                  .filter((e) => e.month === monthIdx + 1)
                  .reduce((sum, e) => sum + Number(e.value), 0);
                return (
                  <td key={monthIdx} className="text-center px-3 py-3 font-bold text-slate-900 text-xs">
                    {monthTotal > 0 ? formatCurrency(monthTotal) : '-'}
                  </td>
                );
              })}
              <td className="text-center px-4 py-3 font-bold text-slate-900 bg-slate-200">
                {formatCurrency(entries.reduce((sum, e) => sum + Number(e.value), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">Nenhum grupo cadastrado</p>
          <p className="text-sm mt-1">Crie um grupo para começar a organizar suas despesas</p>
        </div>
      )}

      <Modal isOpen={groupModal.isOpen} onClose={groupModal.close} title="Novo Grupo">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do grupo</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input"
              placeholder="Ex: Alimentação"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={groupModal.close} className="btn-secondary">Cancelar</button>
            <button onClick={handleCreateGroup} className="btn-primary">Criar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={accountModal.isOpen} onClose={accountModal.close} title="Nova Conta">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
            <select
              value={newAccountGroupId}
              onChange={(e) => setNewAccountGroupId(e.target.value)}
              className="input"
            >
              <option value="">Selecione um grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da conta</label>
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="input"
              placeholder="Ex: Mercado"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={accountModal.close} className="btn-secondary">Cancelar</button>
            <button onClick={handleCreateAccount} className="btn-primary">Criar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={statusModal.isOpen} onClose={statusModal.close} title="Status do Pagamento">
        {selectedEntry && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <p>
                Valor:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(Number(selectedEntry.value))}
                </span>
              </p>
              {selectedEntry.installment && selectedEntry.totalInstallments && (
                <p className="mt-1">
                  Parcela: {selectedEntry.installment}/{selectedEntry.totalInstallments}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdatePaymentStatus('PENDING')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${selectedEntry.paymentStatus === 'PENDING' || !selectedEntry.paymentStatus
                  ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                  : 'border-slate-200 hover:border-red-300 hover:bg-red-50'
                  }`}
              >
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <span className="font-medium text-red-600">Pendente</span>
                  <p className="text-xs text-slate-500">Ainda não pago</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdatePaymentStatus('PAID_ON_TIME')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${selectedEntry.paymentStatus === 'PAID_ON_TIME'
                  ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                  : 'border-slate-200 hover:border-green-300 hover:bg-green-50'
                  }`}
              >
                <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <span className="font-medium text-green-700">Paguei em dia</span>
                  <p className="text-xs text-slate-500">Pagamento realizado no prazo</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdatePaymentStatus('PAID_LATE')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${selectedEntry.paymentStatus === 'PAID_LATE'
                  ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200'
                  : 'border-slate-200 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                <div>
                  <span className="font-medium text-yellow-700">Paguei com atraso</span>
                  <p className="text-xs text-slate-500">Pagamento realizado após o vencimento</p>
                </div>
              </button>
            </div>

            <div className="flex gap-3 justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  statusModal.close();
                  startEdit(selectedEntry.accountId, selectedEntry.month);
                }}
                className="btn-secondary text-sm"
              >
                Editar Valor
              </button>
              <button
                onClick={() => {
                  handleDeleteEntry(selectedEntry.id);
                  statusModal.close();
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

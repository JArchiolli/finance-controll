import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { Header } from '../components/Layout/Header';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardData } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#84cc16'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dashboardService.getSummary(year);
      setData(result);
    } catch {
      toast.error('Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Encontrar maior e menor mês
  const nonZeroMonths = data.monthlyData.filter((m) => m.total > 0);
  const maxMonth = nonZeroMonths.reduce((a, b) => (a.total > b.total ? a : b), nonZeroMonths[0]);
  const minMonth = nonZeroMonths.reduce((a, b) => (a.total < b.total ? a : b), nonZeroMonths[0]);

  return (
    <div>
      <Header title="Dashboard" subtitle={`Resumo financeiro de ${year}`}>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1">
          <button onClick={() => setYear((y) => y - 1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-lg min-w-[60px] text-center">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronRight size={18} />
          </button>
        </div>
      </Header>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <DollarSign className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total do Ano</p>
            <p className="text-xl font-bold">{formatCurrency(data.yearTotal)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Média Mensal</p>
            <p className="text-xl font-bold">{formatCurrency(data.monthAverage)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <TrendingUp className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Mês Maior Gasto</p>
            <p className="text-xl font-bold">{maxMonth?.label || '-'}</p>
            <p className="text-xs text-slate-400">{maxMonth ? formatCurrency(maxMonth.total) : ''}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingDown className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Mês Menor Gasto</p>
            <p className="text-xl font-bold">{minMonth?.label || '-'}</p>
            <p className="text-xs text-slate-400">{minMonth ? formatCurrency(minMonth.total) : ''}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras — Total por mês */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Despesas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pizza — Total por grupo */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Grupo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.groupData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.groupData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de linha — Tendência mensal */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tendência Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 8 }}
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

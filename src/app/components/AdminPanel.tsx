import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  Download,
  Lock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { getGuests, getStatistics, clearAllData, adminLogin, exportToCSV, deleteRSVP } from '../utils/api';
import type { Guest } from '../utils/api';

export function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState({
    totalGuests: 0,
    confirmed: 0,
    declined: 0,
    totalConfirmed: 0,
    adults: 0,
    children: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async (authToken: string) => {
    try {
      setIsLoading(true);
      const [guestsData, statsData] = await Promise.all([
        getGuests(authToken),
        getStatistics(authToken),
      ]);
      setGuests(guestsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.message || 'Tente novamente'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const result = await adminLogin(password);
      setToken(result.token);
      setIsAuthenticated(true);
      await loadData(result.token);
      toast.success('Acesso autorizado!');
    } catch (error: any) {
      toast.error(error.message || 'Senha incorreta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Tem certeza que deseja excluir TODOS os dados? Esta ação não pode ser desfeita.')) {
      try {
        if (!token) return;
        await clearAllData(token);
        await loadData(token);
        toast.success('Dados limpos com sucesso');
      } catch (error: any) {
        toast.error('Erro ao limpar dados: ' + (error.message || 'Tente novamente'));
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      if (!token) return;
      const blob = await exportToCSV(token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `confirmacoes_aniversario_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Dados exportados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao exportar dados: ' + (error.message || 'Tente novamente'));
    }
  };
  const handleDeleteRSVP = async (rsvpId: string, responsibleName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a confirmação de "${responsibleName}"? Esta ação não pode ser desfeita.`)) {
      try {
        if (!token) return;
        await deleteRSVP(token, rsvpId);
        await loadData(token);
        toast.success('Confirmação deletada com sucesso');
      } catch (error: any) {
        toast.error('Erro ao deletar confirmação: ' + (error.message || 'Tente novamente'));
      }
    }
  };
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Área Administrativa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password">Senha de acesso</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    className="mt-1"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Dica: senha foi enviada por email
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Autenticando...' : 'Entrar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao convite
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl text-blue-900 mb-2">
                Painel Administrativo
              </h1>
              <p className="text-blue-700">Gerenciamento de confirmações</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword('');
                  setToken(null);
                  navigate('/');
                }}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button variant="outline" onClick={handleExportCSV} disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearData}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Respostas</p>
                  <p className="text-2xl">{stats.totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confirmados</p>
                  <p className="text-2xl">{stats.confirmed}</p>
                  <p className="text-xs text-gray-500">
                    {stats.totalConfirmed} pessoa(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não Confirmados</p>
                  <p className="text-2xl">{stats.declined}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Adultos</p>
                  <p className="text-2xl">{stats.adults}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crianças</p>
                  <p className="text-2xl">{stats.children}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Convidados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Lista Completa de Convidados</CardTitle>
            </CardHeader>
            <CardContent>
              {guests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma confirmação recebida ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Confirmação</TableHead>
                        <TableHead>Participante</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Idade</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guests.flatMap((guest) => {
                        if (guest.confirmation === 'nao') {
                          return [
                            <TableRow key={`${guest.id}-declined`}>
                              <TableCell className="font-medium">
                                {guest.responsibleName}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-sm">
                                  <XCircle className="w-4 h-4" />
                                  Não comparecerá
                                </span>
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(guest.timestamp).toLocaleString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteRSVP(guest.id, guest.responsibleName)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>,
                          ];
                        }

                        return guest.participants.map((participant, index) => (
                          <TableRow key={`${guest.id}-${index}`}>
                            <TableCell className="font-medium">
                              {guest.responsibleName}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Confirmado
                              </span>
                            </TableCell>
                            <TableCell>{participant.name}</TableCell>
                            <TableCell>{participant.isChild ? 'Criança' : 'Adulto'}</TableCell>
                            <TableCell>
                              {participant.age === null ? '-' : `${participant.age}`}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(guest.timestamp).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {index === 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteRSVP(guest.id, guest.responsibleName)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Informações Importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Os dados são armazenados localmente no navegador (localStorage)</li>
                <li>• Para acesso em outro dispositivo, use a função "Exportar CSV"</li>
                <li>• A senha de acesso é: "Pequenoprincipe2026@"</li>
                <li>• Limpar dados remove todas as confirmações permanentemente</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

}

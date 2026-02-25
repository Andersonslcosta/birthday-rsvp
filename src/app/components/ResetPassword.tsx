import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { toast } from 'sonner';
import { validateResetToken, resetPassword } from '../utils/api';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperação inválido');
      navigate('/admin');
      return;
    }

    const validateToken = async () => {
      try {
        setIsValidating(true);
        const result = await validateResetToken(token);
        
        if (result.success) {
          setIsValidToken(true);
        } else {
          toast.error('Link de recuperação expirado ou inválido');
          setTimeout(() => navigate('/admin'), 2000);
        }
      } catch (error: any) {
        toast.error('Erro ao validar token de recuperação');
        setTimeout(() => navigate('/admin'), 2000);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    // Validar senha forte
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('A senha deve conter pelo menos uma letra maiúscula');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error('A senha deve conter pelo menos uma letra minúscula');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error('A senha deve conter pelo menos um número');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      toast.error('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setIsLoading(true);
      const result = await resetPassword(token!, newPassword);
      
      if (result.success) {
        toast.success('Senha redefinida com sucesso!');
        toast.warning('Lembre-se de atualizar a variável ADMIN_PASSWORD no arquivo .env e reiniciar o servidor.', {
          duration: 8000,
        });
        
        setTimeout(() => navigate('/admin'), 3000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validando link de recuperação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Digite sua nova senha
            </p>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="font-medium text-sm">Requisitos da senha:</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• Mínimo 8 caracteres</li>
                  <li>• Pelo menos uma letra maiúscula</li>
                  <li>• Pelo menos uma letra minúscula</li>
                  <li>• Pelo menos um número</li>
                  <li>• Pelo menos um caractere especial (!@#$%^&*...)</li>
                </ul>
              </div>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="mt-1"
                  disabled={isLoading}
                  required
                  minLength={8}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Após redefinir a senha, você precisará atualizar
                  a variável de ambiente <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code> no servidor Railway.
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

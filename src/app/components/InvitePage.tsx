import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Clock, Plus, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { saveRSVP } from '../utils/api';
import type { Participant } from '../utils/api';

export function InvitePage() {
  const [responsibleName, setResponsibleName] = useState('');
  const [confirmation, setConfirmation] = useState<'sim' | 'nao'>('sim');
  const [participants, setParticipants] = useState<Participant[]>([{ name: '', age: 0, isChild: false }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o primeiro participante quando o nome do responsável muda e confirmação é "sim"
  useEffect(() => {
    if (confirmation === 'sim' && responsibleName.trim()) {
      setParticipants((prev) => {
        const updated = [...prev];
        updated[0] = { ...updated[0], name: responsibleName.trim() };
        return updated;
      });
    }
  }, [responsibleName, confirmation]);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', age: 0, isChild: false }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: 'name' | 'age', value: string) => {
    const updated = [...participants];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value };
    } else if (field === 'age') {
      const age = parseInt(value) || 0;
      updated[index] = { ...updated[index], age, isChild: age < 18 };
    }
    setParticipants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!responsibleName.trim()) {
      toast.error('Por favor, preencha seu nome completo');
      return;
    }

    if (confirmation === 'sim') {
      const invalidParticipant = participants.find(
        (p) => !p.name.trim() || p.age === 0 || p.age < 0
      );
      if (invalidParticipant) {
        toast.error('Por favor, preencha nome e idade de todos os participantes');
        return;
      }
    }

    setIsSubmitting(true);

    // Salvar dados
    saveRSVP({
      responsibleName: responsibleName.trim(),
      confirmation,
      totalPeople: confirmation === 'sim' ? participants.length : 0,
      participants: confirmation === 'sim' ? participants.map(p => ({
        name: p.name.trim(),
        age: Math.floor(p.age),
        isChild: Math.floor(p.age) < 18,
      })) : [],
      timestamp: new Date().toISOString(),
    })
      .then(() => {
        toast.success(
          confirmation === 'sim'
            ? '✨ Presença confirmada! Nos vemos na festa!'
            : 'Confirmação recebida. Sentiremos sua falta! 💙'
        );

        // Resetar formulário
        setResponsibleName('');
        setConfirmation('sim');
        setParticipants([{ name: '', age: 0, isChild: false }]);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message || 'Erro ao salvar confirmação. Tente novamente.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-amber-50 relative overflow-hidden">
      {/* Estrelas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-300 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-amber-400" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl text-blue-900 mb-4">
            O pequeno príncipe completa 1 aninho ✨
          </h1>
          
          <p className="text-lg md:text-xl text-blue-700 italic max-w-2xl mx-auto">
            "O essencial é invisível aos olhos"
            <br />
            <span className="text-base">— Venha celebrar este momento especial conosco —</span>
          </p>
        </motion.div>

        {/* Banner com imagem */}
        <motion.div
          className="mb-12 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-300 via-blue-200 to-amber-200 p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👑</div>
              <p className="text-2xl font-bold text-blue-900">Oliver faz 1 aninho!</p>
              <p className="text-blue-700 mt-2">Venha celebrar este momento mágico conosco</p>
            </div>
          </div>
        </motion.div>

        {/* Informações do Evento */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl text-blue-900 mb-6 text-center flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                Detalhes da Festa
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </h2>

              <div className="space-y-4 text-blue-800">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Data</p>
                    <p className="text-blue-700">Sábado, 15 de Março de 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Horário</p>
                    <p className="text-blue-700">14h00 às 18h00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Local</p>
                    <p className="text-blue-700">
                      Salão de Festas Estrela Dourada
                      <br />
                      Rua das Rosas, 123 - Jardim Primavera
                      <br />
                      São Paulo - SP
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Confirmação */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl text-blue-900 mb-6 text-center">
                Confirme sua presença
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome do Responsável */}
                <div>
                  <Label htmlFor="responsibleName" className="text-blue-900">
                    Nome completo do responsável *
                  </Label>
                  <Input
                    id="responsibleName"
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Confirmação */}
                <div>
                  <Label className="text-blue-900 mb-3 block">
                    Confirmação de presença *
                  </Label>
                  <RadioGroup
                    value={confirmation}
                    onValueChange={(value) => setConfirmation(value as 'sim' | 'nao')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="sim" />
                      <Label htmlFor="sim" className="cursor-pointer">
                        Sim, estarei presente! 🎉
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="nao" />
                      <Label htmlFor="nao" className="cursor-pointer">
                        Não poderei comparecer 😢
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Lista de Participantes */}
                {confirmation === 'sim' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-blue-900">
                        Lista de participantes (incluindo você) *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addParticipant}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {participants.map((participant, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-2 items-start"
                        >
                          <div className="flex-1">
                            <Input
                              placeholder={index === 0 ? "Seu nome (preenchido automaticamente)" : "Nome completo"}
                              value={participant.name}
                              onChange={(e) =>
                                updateParticipant(index, 'name', e.target.value)
                              }
                              disabled={index === 0}
                              required={confirmation === 'sim'}
                              className={index === 0 ? "bg-blue-50" : ""}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              placeholder="Idade"
                              type="number"
                              min="0"
                              max="120"
                              value={participant.age}
                              onChange={(e) =>
                                updateParticipant(index, 'age', e.target.value)
                              }
                              required={confirmation === 'sim'}
                            />
                          </div>
                          {participants.length > 1 && index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParticipant(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-sm text-blue-600">
                      Total de pessoas: {participants.length}
                    </p>
                  </div>
                )}

                {/* Botão de Envio */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Presença'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Link para Admin */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Área Administrativa
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

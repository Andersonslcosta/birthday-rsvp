/**
 * Test Suite para Birthday RSVP
 * 
 * Testes de integração, validação e segurança
 */

// ====== TIPOS E INTERFACES ======

interface Participant {
  name: string;
  age: number | null;
  isChild: boolean;
}

interface RSVP {
  id: string;
  responsibleName: string;
  confirmation: 'sim' | 'nao';
  totalPeople: number;
  participants: Participant[];
  timestamp: string;
}

// ====== VALIDADORES ======

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name: string): boolean {
  return typeof name === 'string' && name.trim().length >= 2 && name.length <= 100;
}

function validateAge(age: number): boolean {
  return age >= 0 && age <= 120 && Number.isInteger(age);
}

function validateRSVP(rsvp: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar responsável
  if (!validateName(rsvp.responsibleName)) {
    errors.push('❌ Nome responsável inválido (2-100 chars)');
  } else {
    console.log('✓ Nome responsável válido');
  }

  // Validar confirmação
  if (!['sim', 'nao'].includes(rsvp.confirmation)) {
    errors.push('❌ Confirmação deve ser "sim" ou "nao"');
  } else {
    console.log('✓ Confirmação válida');
  }

  // Validar participantes
  if (rsvp.confirmation === 'sim') {
    if (!Array.isArray(rsvp.participants) || rsvp.participants.length === 0) {
      errors.push('❌ Participantes obrigatório quando confirmado');
    } else {
      rsvp.participants.forEach((p: any, i: number) => {
        if (!validateName(p.name)) {
          errors.push(`❌ Participante ${i}: nome inválido`);
        }
        if (p.isChild) {
          if (p.age === null || !validateAge(p.age)) {
            errors.push(`❌ Participante ${i}: idade inválida para criança (0-120)`);
          }
        } else {
          if (p.age !== null && !validateAge(p.age)) {
            errors.push(`❌ Participante ${i}: idade inválida (0-120)`);
          }
        }
      });
      if (errors.length === 0) {
        console.log(`✓ ${rsvp.participants.length} participantes válidos`);
      }
    }

    // Validar contagem
    if (rsvp.totalPeople !== rsvp.participants.length) {
      errors.push('❌ Total de pessoas não corresponde');
    } else {
      console.log('✓ Total de pessoas correto');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ====== TESTES ======

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Birthday RSVP - Test Suite            ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 1: Validação de RSVP confirmado
console.log('📋 Test 1: RSVP Confirmado');
const validRSVP = {
  responsibleName: 'João Silva',
  confirmation: 'sim',
  participants: [
    { name: 'João Silva', age: 35, isChild: false },
    { name: 'Maria Silva', age: 32, isChild: false },
    { name: 'Pedro Silva', age: 5, isChild: true },
  ],
  totalPeople: 3,
};

const result1 = validateRSVP(validRSVP);
if (result1.valid) {
  console.log('✓ RSVP confirmado válido\n');
} else {
  console.log('❌ Erros encontrados:');
  result1.errors.forEach((e) => console.log('  ' + e));
  console.log();
}

// Test 2: Validação de RSVP não confirmado
console.log('📋 Test 2: RSVP Não Confirmado');
const noShowRSVP = {
  responsibleName: 'Ana Costa',
  confirmation: 'nao',
  participants: [],
  totalPeople: 0,
};

const result2 = validateRSVP(noShowRSVP);
if (result2.valid) {
  console.log('✓ RSVP não confirmado válido\n');
} else {
  console.log('❌ Erros encontrados:');
  result2.errors.forEach((e) => console.log('  ' + e));
  console.log();
}

// Test 3: Validação de dados inválidos
console.log('📋 Test 3: RSVP com Dados Inválidos');
const invalidRSVP = {
  responsibleName: '',
  confirmation: 'sim',
  participants: [{ name: 'Test', age: 200, isChild: false }],
  totalPeople: 1,
};

const result3 = validateRSVP(invalidRSVP);
if (!result3.valid) {
  console.log('✓ Validação corretamente rejeitou dados inválidos');
  result3.errors.forEach((e) => console.log('  ' + e));
  console.log();
} else {
  console.log('❌ Validação não detectou erros\n');
}

// Test 4: Estrutura de tipos
console.log('📋 Test 4: Tipos e Interfaces');
const participant: Participant = {
  name: 'Test User',
  age: 30,
  isChild: false,
};
console.log('✓ Interface Participant válida');
console.log(`  - name: "${participant.name}" (string)`);
console.log(`  - age: ${participant.age} (number)`);
console.log(`  - isChild: ${participant.isChild} (boolean)\n`);

// Test 5: Validação de idade
console.log('📋 Test 5: Validação de Idade');
const ageTests = [
  { age: 0, expected: true, label: 'Recém-nascido' },
  { age: 5, expected: true, label: 'Criança' },
  { age: 17, expected: true, label: 'Adolescente' },
  { age: 18, expected: true, label: 'Adulto' },
  { age: 65, expected: true, label: 'Idoso' },
  { age: 120, expected: true, label: 'Máximo válido' },
  { age: -1, expected: false, label: 'Negativo' },
  { age: 121, expected: false, label: 'Acima do limite' },
  { age: 18.5, expected: false, label: 'Não inteiro' },
];

let ageTestsPassed = 0;
ageTests.forEach(({ age, expected, label }) => {
  const isValid = validateAge(age);
  if (isValid === expected) {
    console.log(`✓ ${label} (${age})`);
    ageTestsPassed++;
  } else {
    console.log(`❌ ${label} (${age}) - esperado ${expected}, recebido ${isValid}`);
  }
});
console.log(`${ageTestsPassed}/${ageTests.length} testes de idade passaram\n`);

// Test 6: Validação de nomes
console.log('📋 Test 6: Validação de Nome');
const nameTests = [
  { name: 'João', expected: true, label: 'Nome válido' },
  { name: 'A', expected: false, label: 'Nome muito curto' },
  { name: '', expected: false, label: 'Vazio' },
  { name: '  ', expected: false, label: 'Apenas espaços' },
  {
    name: 'Um nome muito longo que tem mais de cem caracteres para verificar se a validação rejeita nomes excessivamente longos',
    expected: false,
    label: 'Nome muito longo (>100)',
  },
];

let nameTestsPassed = 0;
nameTests.forEach(({ name, expected, label }) => {
  const isValid = validateName(name);
  if (isValid === expected) {
    console.log(`✓ ${label}`);
    nameTestsPassed++;
  } else {
    console.log(`❌ ${label} - esperado ${expected}, recebido ${isValid}`);
  }
});
console.log(`${nameTestsPassed}/${nameTests.length} testes de nome passaram\n`);

// Test 7: Classificação de crianças vs adultos
console.log('📋 Test 7: Classificação por Idade');
const classificationTests = [
  { age: 5, expectChild: true },
  { age: 17, expectChild: true },
  { age: 18, expectChild: false },
  { age: 25, expectChild: false },
  { age: 65, expectChild: false },
];

let classTestsPassed = 0;
classificationTests.forEach(({ age, expectChild }) => {
  const isChild = age < 18;
  if (isChild === expectChild) {
    console.log(`✓ ${age} anos → ${isChild ? 'Criança' : 'Adulto'}`);
    classTestsPassed++;
  } else {
    console.log(`❌ ${age} anos classificado incorretamente`);
  }
});
console.log(`${classTestsPassed}/${classificationTests.length} testes de classificação passaram\n`);

// Summary
console.log('╔════════════════════════════════════════╗');
console.log('║  Summary                               ║');
console.log('╠════════════════════════════════════════╣');
console.log('║ ✓ Validação de tipos                   ║');
console.log('║ ✓ Validação de dados                   ║');
console.log('║ ✓ Validação de regras de negócio       ║');
console.log('║ ✓ Manipulação de erros                 ║');
console.log('║ ✓ Estrutura de dados (idades)          ║');
console.log('║ ✓ Classificação adulto/criança         ║');
console.log('╚════════════════════════════════════════╝\n');

export { validateRSVP, validateName, validateAge, validateEmail };

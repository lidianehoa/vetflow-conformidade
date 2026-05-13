# VetFlow — Sistema de Planos v2

## Arquivos entregues

```
src/
  firebase.js                  ← configuração Firebase (já com suas credenciais)
  config/
    planos.js                  ← ⭐ FONTE ÚNICA — preços, limites e permissões
  contexts/
    AuthContext.jsx            ← contexto com plan em tempo real (onSnapshot)
  hooks/
    usePlano.js                ← hook de acesso por plano (use em qualquer página)
  components/
    BloqueadoCard.jsx          ← card exibido quando funcionalidade está bloqueada
  pages/
    PlanosAssinatura.jsx       ← tela /pagamento com os 3 planos
firestore.rules                ← regras de segurança do Firestore
```

---

## Passo a passo de integração

### 1. Copie os arquivos para seu projeto
Coloque cada arquivo na pasta `src/` conforme a estrutura acima.

### 2. Atualize os links do PagSeguro
Abra `src/config/planos.js` e substitua os links marcados com 🔧:
```js
freemium:   { pagseguroLink: "https://pag.ae/SEU_LINK_FREEMIUM" },
rtSolo:     { pagseguroLink: "https://pag.ae/81Dobz8Qt" }, // já tem
clinicaPro: { pagseguroLink: "https://pag.ae/SEU_LINK_CLINICA_PRO" },
```

### 3. Envolva o app com AuthProvider
No seu `main.jsx` ou `App.jsx`:
```jsx
import { AuthProvider } from "./contexts/AuthContext";

<AuthProvider>
  <App />
</AuthProvider>
```

### 4. Atualize o roteamento para /pagamento
Substitua o componente antigo de pagamento por:
```jsx
import PlanosAssinatura from "./pages/PlanosAssinatura";

<Route path="/pagamento" element={<PlanosAssinatura onSair={handleSair} />} />
```

### 5. Proteja as páginas com usePlano
Exemplo na página de Documentos (`/documentos`):
```jsx
import { usePlano } from "../hooks/usePlano";
import BloqueadoCard from "../components/BloqueadoCard";

export default function Documentos() {
  const { temAcesso } = usePlano();

  if (!temAcesso("documentos")) {
    return <BloqueadoCard funcionalidade="documentos" />;
  }

  return <>{/* conteúdo normal da página */}</>;
}
```

Exemplo na página de TCLE (`/termos`):
```jsx
const { temAcesso } = usePlano();
if (!temAcesso("tcle")) return <BloqueadoCard funcionalidade="tcle" />;
```

Exemplo no Checklist (limitar itens no freemium):
```jsx
const { isFreemium, limite } = usePlano();
const itensVisiveis = isFreemium
  ? todosItens.slice(0, limite("checklistItens"))
  : todosItens;
```

Exemplo para limitar auditorias salvas:
```jsx
const { atingiuLimite } = usePlano();
if (atingiuLimite("auditorias", totalAuditorias)) {
  // exibe aviso de limite atingido
}
```

### 6. Deploy das regras do Firestore
```bash
firebase deploy --only firestore:rules
```

### 7. Webhook PagSeguro → Firestore
Quando o pagamento for confirmado, o PagSeguro chama uma URL sua.
Crie uma Cloud Function para atualizar o plano do usuário:

```js
// Cloud Function (Node.js)
const { getFirestore } = require("firebase-admin/firestore");

exports.pagseguroWebhook = functions.https.onRequest(async (req, res) => {
  const { email, plano } = req.body; // adapte ao payload do PagSeguro

  // Busca o usuário pelo e-mail
  const usersRef = getFirestore().collection("users");
  const snap = await usersRef.where("email", "==", email).limit(1).get();
  if (snap.empty) return res.status(404).send("Usuário não encontrado");

  const uid = snap.docs[0].id;
  // plano deve ser: "freemium", "rtSolo" ou "clinicaPro"
  await getFirestore().doc(`users/${uid}`).update({ plan: plano });

  res.status(200).send("OK");
});
```

---

## Mapa de permissões

| Funcionalidade         | freemium | rtSolo | clinicaPro |
|------------------------|:--------:|:------:|:----------:|
| POPs básicos           | ✅       | ✅     | ✅         |
| Checklist              | ✅ (20)  | ✅     | ✅         |
| Auditorias             | ✅ (3)   | ✅     | ✅         |
| Gerador de TCLE        | 🔒       | ✅     | ✅         |
| Fábrica de Documentos  | 🔒       | ✅     | ✅         |
| Manual Boas Práticas   | 🔒       | ✅     | ✅         |
| Plano 5W2H             | 🔒       | ✅     | ✅         |
| Dashboard de Risco     | 🔒       | ✅     | ✅         |
| Exportação PDF CRMV    | 🔒       | 🔒     | ✅         |
| Múltiplos usuários     | 🔒       | 🔒     | ✅         |

---

## Preços

| Plano       | Valor       | Firestore `plan` |
|-------------|-------------|-----------------|
| Freemium    | R$ 67,90/mês | `"freemium"`   |
| RT Solo     | R$ 97/mês    | `"rtSolo"`     |
| Clínica Pro | R$ 197/mês   | `"clinicaPro"` |
| Sem plano   | —            | `"pending"`    |

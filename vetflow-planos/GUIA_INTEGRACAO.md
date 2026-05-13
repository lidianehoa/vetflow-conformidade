# Guia de Integração — Sistema de Planos VetFlow

## Arquivos entregues

| Arquivo | O que é |
|---|---|
| `usePlano.js` | Hook de permissões — use em qualquer tela |
| `ProtectedRoute.jsx` | Guard atualizado — substitui o `ri` atual |
| `BloqueioRecurso.jsx` | Tela/card de bloqueio com botão de upgrade |
| `PlanosAssinatura.jsx` | Tela de escolha de planos — substitui a atual |

---

## 1. Mapa de acesso por plano

| Tela / Recurso | Freemium | RT Solo (R$97) | Clínica Pro (R$197) |
|---|:---:|:---:|:---:|
| POPs (Fábrica de Docs básica) | ✅ | ✅ | ✅ |
| Perfil / Unidade | ✅ | ✅ | ✅ |
| Checklist Mensal | ❌ | ✅ | ✅ |
| Nova Auditoria (Inspeção 360°) | ❌ | ✅ | ✅ |
| Portal de Compliance (Auditorias) | ❌ | ✅ | ✅ |
| Gerador de TCLE | ❌ | ✅ | ✅ |
| Fábrica de Docs completa | ❌ | ✅ | ✅ |
| Manual de Boas Práticas | ❌ | ✅ | ✅ |
| VET.FLOW Cockpit (Dashboard) | ❌ | ❌ | ✅ |
| Múltiplos usuários | ❌ | ❌ | ✅ |
| Integração SimplesVet | ❌ | ❌ | ✅ |

---

## 2. Valores no Firestore (campo "plan" na coleção "users")

```
"freemium"    → acesso só a POPs
"rt_solo"     → checklist, tcle, 5w2h, manual, docs
"clinica_pro" → acesso completo
"pending"     → sem plano, redireciona para /pagamento
```

---

## 3. Instalar os arquivos no projeto

```
src/
  hooks/
    usePlano.js           ← copie aqui
  components/
    ProtectedRoute.jsx    ← copie aqui (substitui o `ri`)
    BloqueioRecurso.jsx   ← copie aqui
    PlanosAssinatura.jsx  ← copie aqui
```

---

## 4. Atualizar o guard (ProtectedRoute)

No arquivo principal do router (App.jsx ou similar),
substitua `ri` por `ProtectedRoute`:

```jsx
// Antes (código original minificado usa `ri`):
import { ProtectedRoute } from "./components/ProtectedRoute";

// Rotas — mesmo padrão do original, troque ri por ProtectedRoute:
<Route path="/"                    element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
<Route path="/auditorias"          element={<ProtectedRoute><Layout><Auditorias /></Layout></ProtectedRoute>} />
<Route path="/auditorias/nova"     element={<ProtectedRoute><Layout><NovaAuditoria /></Layout></ProtectedRoute>} />
<Route path="/checklist"           element={<ProtectedRoute><Layout><ChecklistMensal /></Layout></ProtectedRoute>} />
<Route path="/termos"              element={<ProtectedRoute><Layout><Termos /></Layout></ProtectedRoute>} />
<Route path="/documentos"          element={<ProtectedRoute><Layout><Documentos /></Layout></ProtectedRoute>} />
<Route path="/documentos/gerar/:id" element={<ProtectedRoute><Layout><GerarDocumento /></Layout></ProtectedRoute>} />
<Route path="/perfil"              element={<ProtectedRoute><Layout><Perfil /></Layout></ProtectedRoute>} />
```

---

## 5. Adicionar guard em cada tela

Copie o bloco abaixo no topo de cada componente de tela:

### /auditorias — Portal de Compliance
```jsx
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import { BloqueioRecurso } from "../components/BloqueioRecurso";

export default function Auditorias() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);

  if (!pode("auditorias")) {
    return <BloqueioRecurso recurso="auditorias" planoMinimo={planoMinimo("auditorias")} />;
  }
  // ... resto do componente
}
```

### /auditorias/nova — Inspeção 360°
```jsx
if (!pode("novaAuditoria")) {
  return <BloqueioRecurso recurso="novaAuditoria" planoMinimo={planoMinimo("novaAuditoria")} />;
}
```

### /checklist — Checklist Mensal
```jsx
if (!pode("checklist")) {
  return <BloqueioRecurso recurso="checklist" planoMinimo={planoMinimo("checklist")} />;
}
```

### /termos — Gerador de TCLE
```jsx
if (!pode("termos")) {
  return <BloqueioRecurso recurso="termos" planoMinimo={planoMinimo("termos")} />;
}
```

### /documentos/gerar/:id — Fábrica de Documentos completa
```jsx
// ATENÇÃO: /documentos (lista de POPs) é liberado no freemium
// Apenas o GERAR (abrir/baixar o doc) é bloqueado
if (!pode("gerarDocumento")) {
  return <BloqueioRecurso recurso="gerarDocumento" planoMinimo={planoMinimo("gerarDocumento")} />;
}
```

### / (Dashboard / VET.FLOW Cockpit)
```jsx
// O dashboard de gráficos (Escudo, Radar) só é Clínica Pro
// Para o freemium e RT Solo, redirecione para /auditorias ou mostre BloqueioRecurso
if (!pode("dashboard")) {
  return <BloqueioRecurso recurso="dashboard" planoMinimo={planoMinimo("dashboard")} />;
}
```

---

## 6. Botão SimplesVet nas auditorias

Na tela de auditorias, o botão "SimplesVet" já existe.
Envolva-o com a verificação de plano:

```jsx
{pode("simplesVet") ? (
  <Button onClick={handleSimpleVet}>SimplesVet</Button>
) : (
  <Tooltip title="Disponível no Clínica Pro">
    <span>
      <Button disabled startIcon={<LockIcon />}>SimplesVet</Button>
    </span>
  </Tooltip>
)}
```

---

## 7. Atualizar a tela de pagamento (/pagamento)

```jsx
import PlanosAssinatura from "./components/PlanosAssinatura";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

// Na rota /pagamento:
function PaginaPagamento() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PlanosAssinatura
      onSair={() => auth.signOut()}
      onFreemium={async () => {
        await updateDoc(doc(db, "users", user.uid), { plan: "freemium" });
        navigate("/documentos"); // freemium vai para POPs
      }}
    />
  );
}
```

---

## 8. Cloud Function — atualizar plano após pagamento PagSeguro

Crie uma Cloud Function HTTP que recebe o webhook do PagSeguro
e atualiza o plano do usuário no Firestore:

```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.pagseguroWebhook = functions.https.onRequest(async (req, res) => {
  const { notificationCode, notificationType } = req.body;
  // Consulte o PagSeguro com o notificationCode para obter status
  // Se status = "PAGA":
  //   - Identifique o plano pelo valor ou referência
  //   - Atualize users/{uid}.plan = "rt_solo" ou "clinica_pro"
  await admin.firestore()
    .collection("users")
    .doc(uid)
    .update({ plan: "rt_solo" }); // ou "clinica_pro"
  res.send("OK");
});
```

---

## 9. Links do PagSeguro

Abra `PlanosAssinatura.jsx` e edite as linhas:

```js
const LINKS = {
  rtSolo:     "https://pag.ae/SEU_LINK_RT_SOLO",
  clinicaPro: "https://pag.ae/SEU_LINK_CLINICA_PRO",
};
```

No PagSeguro, crie cada plano como **Assinatura Recorrente Mensal**.

---

## 10. Deploy final

```bash
npm run build
firebase deploy --only hosting
```

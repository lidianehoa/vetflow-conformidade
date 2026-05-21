// ============================================================================
// © Copyright / Propriedade Intelectual:
// Lidiane Helena Oliveira de Almeida (Adm. de Empresas, Desenvolvedora e Médica Veterinária)
// Todos os direitos reservados.
// ============================================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível do VERTOS OS. Atualizar agora?')) {
      updateSW(true);
    }
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

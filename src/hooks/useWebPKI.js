import { useState, useEffect, useCallback } from 'react';
import LacunaWebPKI from 'web-pki';

/**
 * Hook para gerenciar a integração com Lacuna Web PKI
 */
export const useWebPKI = () => {
  const [pki, setPki] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  useEffect(() => {
    // Inicialização da biblioteca Web PKI
    if (LacunaWebPKI) {
      const instance = new LacunaWebPKI(""); // String vazia para localhost (modo dev)
      setPki(instance);
      
      instance.init({
        ready: () => setIsReady(true),
        notInstalled: () => setError("Extensão Web PKI não instalada."),
        defaultError: (err) => setError(err)
      });
    } else {
      setError("Biblioteca Web PKI não pôde ser carregada.");
    }
  }, []);

  const refreshCertificates = useCallback(() => {
    if (!isReady || !pki) return;
    
    setLoadingCertificates(true);
    pki.listCertificates({
      success: (certs) => {
        setCertificates(certs);
        setLoadingCertificates(false);
      },
      error: (err) => {
        setError(err);
        setLoadingCertificates(false);
      }
    });
  }, [isReady, pki]);

  const signHash = useCallback((certificateThumbprint, hash) => {
    return new Promise((resolve, reject) => {
      if (!pki) return reject("PKI não inicializado");

      pki.signHash({
        thumbprint: certificateThumbprint,
        hash: hash,
        digestAlgorithm: "SHA256",
        success: (signature) => resolve(signature),
        error: (err) => reject(err)
      });
    });
  }, [pki]);

  return {
    isReady,
    error,
    certificates,
    loadingCertificates,
    refreshCertificates,
    signHash,
    pki
  };
};

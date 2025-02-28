"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiCopy, FiTrash } from "react-icons/fi";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";

interface PixKey {
  id: string;
  key: string;
  type: string;
}

interface PixManagerProps {
  clientId?: string;
}

const PixManager: React.FC<PixManagerProps> = ({ clientId }) => {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPixKey, setNewPixKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchPixKeys = useCallback(async () => {
    setLoading(true);
    try {
      const url = clientId
        ? `${process.env.NEXT_PUBLIC_ListPixKey_URL}?clientId=${clientId}`
        : process.env.NEXT_PUBLIC_ListPixKey_URL!;
      const response = await axios.get(url);
      const data = response.data as { keys: PixKey[] };
      setPixKeys(data.keys);
    } catch (err) {
      setError("Erro ao listar as chaves Pix.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createPixKey = async () => {
    if (!newPixKey) return;
    setLoading(true);
    try {
      const payload = clientId
        ? { key: newPixKey, clientId }
        : { key: newPixKey };
      await axios.post(process.env.NEXT_PUBLIC_CreatePixKey_URL!, payload);
      fetchPixKeys();
      setNewPixKey("");
    } catch (err) {
      setError("Erro ao criar a chave Pix.");
    } finally {
      setLoading(false);
    }
  };

  const deletePixKey = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_DeletPixKey_URL!}${id}`);
      fetchPixKeys();
    } catch (err) {
      setError("Erro ao excluir a chave Pix.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("Chave Pix copiada!");
  };

  useEffect(() => {
    fetchPixKeys();
  }, [fetchPixKeys]);

  return (
    <div className="p-6 bg-[#181B21] text-white rounded-lg space-y-6">
      <div className="p-4 bg-[#25282E] rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {clientId ? "Chaves Pix do Cliente" : "Minhas Chaves Pix"}
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={newPixKey}
            onChange={(e) => setNewPixKey(e.target.value)}
            placeholder="Digite a chave Pix"
            className="px-4 py-2 rounded bg-gray-800 text-white w-full"
          />
          <button
            onClick={createPixKey}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Criar
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="p-4 bg-[#25282E] rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Lista de Chaves Pix</h2>
        {loading ? (
          <Image
            src={loadingSpinner}
            alt="Carregando..."
            className="w-[300px] h-[300px] animate-spin"
          />
        ) : pixKeys.length === 0 ? (
          <p className="text-red-500">Nenhuma chave Pix encontrada.</p>
        ) : (
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2">Chave</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pixKeys.map((pixKey) => (
                <tr key={pixKey.id} className="border-b border-gray-600">
                  <td className="px-4 py-2">{pixKey.key}</td>
                  <td className="px-4 py-2">{pixKey.type}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleCopy(pixKey.key)}
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <FiCopy /> Copiar
                    </button>
                    <button
                      onClick={() => deletePixKey(pixKey.id)}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <FiTrash /> Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PixManager;

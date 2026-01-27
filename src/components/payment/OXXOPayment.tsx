'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Copy, Check, MapPin } from 'lucide-react';
import Image from 'next/image';

interface OXXOPaymentProps {
  reference: string;
  amount: number;
  expiresAt: Date;
  appointmentId: string;
  onComplete?: () => void;
}

export function OXXOPayment({
  reference,
  amount,
  expiresAt,
  appointmentId,
  onComplete,
}: OXXOPaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // Generate PDF voucher (would use jsPDF or similar)
    // For now, trigger print dialog
    window.print();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Paga en OXXO</h2>
              <p className="text-red-50">
                Tu cita está reservada. Completa el pago antes de:
              </p>
              <p className="text-lg font-semibold mt-1">
                {formatDate(expiresAt)}
              </p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{formatCurrency(amount)}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 space-y-6">
          {/* Reference Number */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Referencia de pago:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-3">
                <code className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {reference}
                </code>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Cómo pagar en OXXO:
            </h3>

            <div className="space-y-3">
              <Step number={1}>
                Acude a la tienda OXXO más cercana
              </Step>
              <Step number={2}>
                Indica en caja que quieres realizar un pago de servicios
              </Step>
              <Step number={3}>
                Proporciona el número de referencia:{' '}
                <code className="font-mono font-bold text-blue-600">
                  {reference}
                </code>
              </Step>
              <Step number={4}>
                Realiza el pago en efectivo por{' '}
                <span className="font-bold text-gray-900">
                  {formatCurrency(amount)}
                </span>
              </Step>
              <Step number={5}>
                Conserva tu comprobante de pago
              </Step>
              <Step number={6}>
                Tu cita será confirmada automáticamente en 10-15 minutos
              </Step>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Importante:
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 ml-6 list-disc">
              <li>El pago debe realizarse antes de la fecha límite</li>
              <li>Si no pagas a tiempo, tu cita será cancelada automáticamente</li>
              <li>OXXO cobra una comisión de $10-15 MXN por servicio</li>
              <li>
                Recibirás un email de confirmación cuando procesemos tu pago
              </li>
            </ul>
          </div>

          {/* Find OXXO */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Encuentra un OXXO cercano:
            </h4>
            <a
              href="https://www.oxxo.com/ubicaciones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 font-semibold underline"
            >
              Ver mapa de tiendas OXXO →
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
            >
              <Printer className="w-5 h-5" />
              Imprimir ficha
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>

          {/* Already Paid */}
          {onComplete && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">¿Ya realizaste el pago?</p>
              <button
                onClick={onComplete}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Verificar estado del pago
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Support */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Problemas con tu pago?{' '}
          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Contacta soporte
          </a>
        </p>
      </div>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <p className="flex-1 text-gray-700 pt-1">{children}</p>
    </div>
  );
}

/**
 * SPEI Payment Component (Mexican bank transfer)
 */
export function SPEIPayment({
  clabe,
  amount,
  reference,
  bankName,
  accountHolder,
  expiresAt,
}: {
  clabe: string;
  amount: number;
  reference: string;
  bankName: string;
  accountHolder: string;
  expiresAt: Date;
}) {
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Transferencia SPEI</h2>
          <p className="text-green-50">Realiza tu pago mediante transferencia bancaria</p>
        </div>

        {/* Bank Details */}
        <div className="p-6 space-y-6">
          <BankDetail
            label="CLABE interbancaria"
            value={clabe}
            copyable
            onCopy={() => {
              navigator.clipboard.writeText(clabe);
              setCopiedClabe(true);
              setTimeout(() => setCopiedClabe(false), 2000);
            }}
            copied={copiedClabe}
          />

          <BankDetail label="Banco" value={bankName} />

          <BankDetail label="Beneficiario" value={accountHolder} />

          <BankDetail
            label="Referencia"
            value={reference}
            copyable
            onCopy={() => {
              navigator.clipboard.writeText(reference);
              setCopiedRef(true);
              setTimeout(() => setCopiedRef(false), 2000);
            }}
            copied={copiedRef}
          />

          <BankDetail
            label="Monto a transferir"
            value={formatCurrency(amount)}
            highlight
          />

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3">Instrucciones:</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Ingresa a tu banca en línea o app móvil</li>
              <li>Selecciona "Transferencias SPEI"</li>
              <li>Ingresa la CLABE y el monto exacto</li>
              <li>Usa la referencia proporcionada</li>
              <li>Confirma la transferencia</li>
              <li>Guarda tu comprobante</li>
            </ol>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              ✓ La confirmación es automática e inmediata (1-3 minutos)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BankDetail({
  label,
  value,
  copyable,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-2">
        {label}:
      </label>
      <div className="flex items-center gap-3">
        <div
          className={`flex-1 rounded-lg px-4 py-3 ${
            highlight
              ? 'bg-yellow-100 border-2 border-yellow-400'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <code
            className={`font-mono font-bold ${
              highlight ? 'text-xl text-yellow-900' : 'text-lg text-gray-900'
            }`}
          >
            {value}
          </code>
        </div>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

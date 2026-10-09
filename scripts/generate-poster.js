import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BG_IMG_PATH = path.join(ROOT_DIR, 'public/fondo_colegual_card.png');
const LOGO_WHITE_PATH = path.join(ROOT_DIR, 'public/Logo Colegual.png');
const OUTPUT_PNG = path.join(ROOT_DIR, 'Afiche_Promocional_Banco_Colegual.png');
const OUTPUT_PUBLIC_PNG = path.join(ROOT_DIR, 'public/Afiche_Promocional_Banco_Colegual.png');

async function main() {
  console.log('🎨 Generando Afiche Promocional del Banco Escolar Colegual...');

  // 1. Cargar imágenes en Base64
  const bgBase64 = `data:image/png;base64,${fs.readFileSync(BG_IMG_PATH).toString('base64')}`;
  const logoWhiteBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_WHITE_PATH).toString('base64')}`;

  // 2. Generar QR de muestra para la tarjeta del afiche
  const sampleQr = await QRCode.toDataURL('COLEGUAL:27980123-4', {
    width: 280,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' }
  });

  // 3. Crear HTML del Afiche (1200 x 1700 px)
  const posterHtml = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Afiche Promocional - Banco Escolar Colegual</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Caveat:wght@700&display=swap" rel="stylesheet">
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        width: 1200px;
        height: 1700px;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #022019;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }

      /* Fondo escénico con gradientes esmeralda y destellos dorados */
      .poster-bg {
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 50% 12%, rgba(16, 185, 129, 0.45) 0%, transparent 45%),
          radial-gradient(circle at 85% 42%, rgba(245, 158, 11, 0.25) 0%, transparent 42%),
          radial-gradient(circle at 15% 65%, rgba(5, 150, 105, 0.32) 0%, transparent 45%),
          radial-gradient(circle at 50% 92%, rgba(217, 119, 6, 0.25) 0%, transparent 45%),
          linear-gradient(180deg, #021a14 0%, #064e3b 22%, #022c22 55%, #051b14 100%);
        z-index: 0;
      }

      /* Malla sutil de estrellas y micro-destellos */
      .poster-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: 
          radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
          radial-gradient(rgba(245, 158, 11, 0.25) 1.5px, transparent 1.5px);
        background-size: 40px 40px, 80px 80px;
        background-position: 0 0, 20px 20px;
        opacity: 0.35;
      }

      .poster-content {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 42px 50px 38px 50px;
      }

      /* CABECERA INSTITUCIONAL */
      .header-institution {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 99px;
        padding: 10px 28px 10px 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .inst-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .inst-logo-img {
        height: 48px;
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
      }

      .inst-divider {
        width: 1px;
        height: 32px;
        background: rgba(255, 255, 255, 0.2);
      }

      .inst-subtext {
        font-size: 0.82rem;
        color: #a7f3d0;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .inst-pill-tag {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 7px 18px;
        border-radius: 99px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      /* TÍTULO PRINCIPAL DE IMPACTO */
      .hero-title-area {
        text-align: center;
        margin-top: 10px;
        margin-bottom: 5px;
      }

      .badge-announcement {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(16, 185, 129, 0.25);
        border: 1.5px solid rgba(52, 211, 153, 0.6);
        color: #a7f3d0;
        font-size: 0.95rem;
        font-weight: 800;
        padding: 7px 22px;
        border-radius: 99px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
        box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
      }

      .main-title {
        font-family: 'Outfit', sans-serif;
        font-size: 4.1rem;
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        color: #ffffff;
        text-shadow: 0 4px 25px rgba(0, 0, 0, 0.5);
      }

      .gold-gradient-text {
        background: linear-gradient(135deg, #fef08a 0%, #fbbf24 35%, #f59e0b 70%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
        filter: drop-shadow(0 4px 18px rgba(245, 158, 11, 0.5));
      }

      .hero-subtitle {
        font-size: 1.25rem;
        color: #e2e8f0;
        font-weight: 600;
        max-width: 860px;
        margin: 12px auto 0 auto;
        line-height: 1.45;
      }

      .hero-subtitle strong {
        color: #fde68a;
      }

      /* ESCAPARATE DE TARJETAS 3D FLOTANTES */
      .cards-stage-container {
        position: relative;
        height: 385px;
        margin: 5px auto;
        display: flex;
        justify-content: center;
        align-items: center;
        perspective: 1200px;
      }

      .cards-glow-sphere {
        position: absolute;
        width: 520px;
        height: 300px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(245, 158, 11, 0.18) 50%, transparent 75%);
        filter: blur(45px);
        z-index: 1;
      }

      /* Tarjeta Frente (Principal con Acuarela) */
      .mockup-card-front {
        position: absolute;
        width: 470px;
        height: 296px;
        border-radius: 20px;
        background-image: url('${bgBase64}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 2.5px solid rgba(255, 255, 255, 0.7);
        box-shadow: 
          -18px 28px 55px rgba(0, 0, 0, 0.7),
          0 12px 28px rgba(6, 78, 59, 0.5),
          inset 0 1px 3px rgba(255, 255, 255, 0.6);
        transform: rotate(-6deg) translate(-75px, -5px);
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 20px;
        overflow: hidden;
      }

      .mockup-card-front::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, 
          rgba(15, 23, 42, 0.65) 0%, 
          rgba(15, 23, 42, 0.04) 30%, 
          rgba(15, 23, 42, 0.08) 65%, 
          rgba(15, 23, 42, 0.88) 100%);
        border-radius: 18px;
        pointer-events: none;
        z-index: 1;
      }

      /* Tarjeta Dorso */
      .mockup-card-back {
        position: absolute;
        width: 450px;
        height: 284px;
        border-radius: 18px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1.5px solid rgba(255, 255, 255, 0.35);
        box-shadow: 
          16px 22px 50px rgba(0, 0, 0, 0.65),
          0 6px 18px rgba(0, 0, 0, 0.4);
        transform: rotate(8deg) translate(145px, 20px);
        z-index: 5;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 15px 20px;
        overflow: hidden;
        opacity: 0.95;
      }

      /* Elementos Frente */
      .front-header {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-pill-title {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.85);
        padding: 5px 12px;
        border-radius: 99px;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .card-pill-title span:first-child {
        font-family: 'Outfit', sans-serif;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #ffffff;
      }

      .card-pill-title span:last-child {
        font-size: 0.68rem;
        font-weight: 700;
        color: #fef08a;
      }

      .card-pill-course {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 0.74rem;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 99px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .front-body {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px;
      }

      .mock-chip {
        width: 50px;
        height: 38px;
        background: linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
        position: relative;
      }

      .mock-chip::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: rgba(120, 53, 15, 0.5);
      }

      .mock-chip::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(120, 53, 15, 0.5);
      }

      .mock-qr-box {
        background: #ffffff;
        padding: 6px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      .mock-qr-img {
        width: 78px;
        height: 78px;
        display: block;
      }

      .mock-qr-label {
        font-size: 0.56rem;
        font-weight: 800;
        color: #0f172a;
        margin-top: 2px;
        letter-spacing: 0.05em;
      }

      .front-footer {
        position: relative;
        z-index: 2;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        padding: 7px 14px;
        backdrop-filter: blur(6px);
      }

      .mock-student-name {
        font-family: 'Outfit', sans-serif;
        font-size: 0.98rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #ffffff;
      }

      .mock-footer-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
        margin-top: 2px;
      }

      .mock-footer-meta .run {
        font-family: monospace;
        font-weight: 700;
        color: #93c5fd;
      }

      .mock-footer-meta .cta {
        font-weight: 700;
        color: #fef08a;
      }

      /* Elementos Dorso */
      .back-top {
        display: flex;
        justify-content: space-between;
        font-size: 0.68rem;
        font-weight: 800;
        color: #cbd5e1;
      }

      .back-stripe {
        width: 100%;
        height: 40px;
        background: #020617;
        margin: 6px 0;
        border-radius: 4px;
      }

      .back-sign {
        background: #ffffff;
        border-radius: 6px;
        padding: 5px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .back-sign span:first-child {
        font-family: 'Caveat', cursive;
        font-size: 1.15rem;
        color: #1e293b;
      }

      .back-sign span:last-child {
        font-family: monospace;
        font-weight: 800;
        font-size: 0.72rem;
        color: #0f172a;
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .back-terms {
        font-size: 0.6rem;
        color: #94a3b8;
        line-height: 1.3;
      }

      /* Monedas doradas flotantes */
      .floating-coin {
        position: absolute;
        z-index: 15;
        border-radius: 50%;
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-family: 'Outfit', sans-serif;
      }

      .coin-1 {
        width: 72px;
        height: 72px;
        top: 15px;
        right: 170px;
        background: radial-gradient(circle at 35% 35%, #fef08a, #f59e0b 60%, #b45309 100%);
        color: #78350f;
        font-size: 1.15rem;
        transform: rotate(15deg);
        border: 3.5px solid #fbbf24;
      }

      .coin-2 {
        width: 56px;
        height: 56px;
        bottom: 20px;
        left: 200px;
        background: radial-gradient(circle at 35% 35%, #fef08a, #f59e0b 60%, #b45309 100%);
        color: #78350f;
        font-size: 0.9rem;
        transform: rotate(-18deg);
        border: 3px solid #fbbf24;
      }

      .floating-tag-qr {
        position: absolute;
        top: 35px;
        left: 135px;
        z-index: 16;
        background: #ffffff;
        color: #064e3b;
        font-weight: 800;
        font-size: 0.9rem;
        padding: 8px 18px;
        border-radius: 99px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        gap: 6px;
        border: 2px solid #34d399;
        transform: rotate(-8deg);
      }

      /* SECCIÓN DE 3 PASOS: CÓMO FUNCIONA */
      .steps-section {
        margin: 5px 0;
      }

      .steps-header {
        text-align: center;
        margin-bottom: 15px;
      }

      .steps-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.65rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
      }

      .step-card {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-radius: 20px;
        padding: 22px 18px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.28);
      }

      .step-card.active {
        border-color: rgba(52, 211, 153, 0.65);
        background: rgba(6, 78, 59, 0.5);
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
      }

      .step-icon-circle {
        width: 66px;
        height: 66px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.1rem;
        margin-bottom: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
      }

      .step-card:nth-child(1) .step-icon-circle {
        background: linear-gradient(135deg, #10b981, #047857);
      }

      .step-card:nth-child(2) .step-icon-circle {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .step-card:nth-child(3) .step-icon-circle {
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      }

      .step-number {
        position: absolute;
        top: 12px;
        right: 14px;
        font-family: 'Outfit', sans-serif;
        font-size: 0.9rem;
        font-weight: 800;
        color: rgba(255, 255, 255, 0.45);
      }

      .step-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.2rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .step-desc {
        font-size: 0.88rem;
        color: #cbd5e1;
        line-height: 1.45;
      }

      /* SECCIÓN DE VALORES Y PREMIOS */
      .values-rewards-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin: 5px 0;
      }

      .block-box {
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 18px;
        padding: 18px 20px;
        backdrop-filter: blur(10px);
      }

      .block-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.05rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .block-title.green {
        color: #a7f3d0;
      }

      .block-title.amber {
        color: #fde68a;
      }

      .pills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .value-pill {
        background: rgba(6, 78, 59, 0.55);
        border: 1px solid rgba(52, 211, 153, 0.4);
        color: #ecfdf5;
        font-size: 0.82rem;
        font-weight: 700;
        padding: 7px 13px;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .value-pill strong {
        color: #fef08a;
      }

      .reward-pill {
        background: rgba(120, 53, 15, 0.4);
        border: 1px solid rgba(245, 158, 11, 0.45);
        color: #fef3c7;
        font-size: 0.82rem;
        font-weight: 700;
        padding: 7px 13px;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* PIE INSTITUCIONAL */
      .poster-footer {
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
        border: 1.5px solid rgba(52, 211, 153, 0.4);
        border-radius: 20px;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      }

      .footer-callout {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .footer-badge-icon {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.7rem;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
      }

      .footer-text h4 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.05rem;
        font-weight: 800;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .footer-text p {
        font-size: 0.8rem;
        color: #a7f3d0;
        margin-top: 2px;
      }

      .footer-credits {
        text-align: right;
        font-size: 0.78rem;
        color: #cbd5e1;
        line-height: 1.45;
      }

      .footer-credits strong {
        color: #fef08a;
      }
    </style>
  </head>
  <body>
    <div class="poster-bg"></div>

    <div class="poster-content">
      <!-- 1. CABECERA INSTITUCIONAL CON LOGO OFICIAL -->
      <div class="header-institution">
        <div class="inst-brand">
          <img src="${logoWhiteBase64}" class="inst-logo-img" alt="Escuela Rural Colegual">
          <div class="inst-divider"></div>
          <span class="inst-subtext">RBD 7967 • Llanquihue, Los Lagos • Sistema de Convivencia y Mérito</span>
        </div>
        <div class="inst-pill-tag">
          💳 Temporada 2026
        </div>
      </div>

      <!-- 2. TITULAR DE IMPACTO -->
      <div class="hero-title-area">
        <div class="badge-announcement">
          ✨ ¡Nuevo Proyecto Escolar! ✨
        </div>
        <h1 class="main-title">
          ¡LLEGA EL BANCO ESCOLAR <span class="gold-gradient-text">COLEGUAL!</span>
        </h1>
        <p class="hero-subtitle">
          Tus valores, esfuerzo diario y compañerismo ahora tienen su propia recompensa oficial en <strong>ColegualCoins (CC)</strong>. ¡Cada estudiante tiene su tarjeta inteligente personal!
        </p>
      </div>

      <!-- 3. ESCAPARATE DE TARJETAS FLOTANTES -->
      <div class="cards-stage-container">
        <div class="cards-glow-sphere"></div>

        <!-- Etiqueta Flotante -->
        <div class="floating-tag-qr">
          ⚡ ¡Con Chip y QR Personal!
        </div>

        <!-- Monedas flotantes -->
        <div class="floating-coin coin-1">
          🪙 CC
        </div>
        <div class="floating-coin coin-2">
          ⭐ 10
        </div>

        <!-- Tarjeta Dorso (Detrás) -->
        <div class="mockup-card-back">
          <div class="back-top">
            <span>ESCUELA RURAL COLEGUAL</span>
            <span style="color: #f59e0b;">RBD 7967</span>
          </div>
          <div class="back-stripe"></div>
          <div class="back-sign">
            <span>Martina (Firma Titular)</span>
            <span>CVV 7967</span>
          </div>
          <p class="back-terms">
            Tarjeta de ahorro ColegualCoins (CC). Acredita mérito y esfuerzo escolar. Válida exclusivamente en Escuela Rural Colegual.
          </p>
        </div>

        <!-- Tarjeta Frente (Principal con Acuarela) -->
        <div class="mockup-card-front">
          <div class="front-header">
            <div class="card-pill-title">
              <span>🏛️ BANCO COLEGUAL</span>
              <span>• 🪙 ColegualCoins</span>
            </div>
            <div class="card-pill-course">
              4° BÁSICO
            </div>
          </div>

          <div class="front-body">
            <div class="mock-chip"></div>
            <div class="mock-qr-box">
              <img src="${sampleQr}" class="mock-qr-img" alt="QR">
              <span class="mock-qr-label">ESCANEAR</span>
            </div>
          </div>

          <div class="front-footer">
            <div class="mock-student-name">MARTINA ANDREA VALENZUELA MUÑOZ</div>
            <div class="mock-footer-meta">
              <span class="run">RUN: 27980123-4</span>
              <span class="cta">CTA: 7967-4B-9801-0001</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. TRES PASOS: CÓMO FUNCIONA -->
      <div class="steps-section">
        <div class="steps-header">
          <h2 class="steps-title">¿Cómo Funciona tu Banco Escolar?</h2>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <span class="step-number">#01</span>
            <div class="step-icon-circle">🌟</div>
            <h3 class="step-title">Destaca con Valores</h3>
            <p class="step-desc">
              Participa en clases, respeta a tus compañeros, cuida tu escuela y mantén una excelente convivencia diaria.
            </p>
          </div>

          <div class="step-card active">
            <span class="step-number">#02</span>
            <div class="step-icon-circle">💳</div>
            <h3 class="step-title">Acumula ColegualCoins</h3>
            <p class="step-desc">
              Tus profesores escanearán tu código QR para abonarte monedas <strong>CC</strong> directamente a tu cuenta de ahorro.
            </p>
          </div>

          <div class="step-card">
            <span class="step-number">#03</span>
            <div class="step-icon-circle">🎁</div>
            <h3 class="step-title">¡Canjea Premios!</h3>
            <p class="step-desc">
              Visita la <strong>Tienda Escolar</strong> y canjea útiles entretenidos, juegos, sorpresas y privilegios especiales.
            </p>
          </div>
        </div>
      </div>

      <!-- 5. VALORES Y RECOMPENSAS -->
      <div class="values-rewards-container">
        <div class="block-box">
          <h3 class="block-title green">🌱 ¿Cómo Ganas ColegualCoins?</h3>
          <div class="pills-list">
            <div class="value-pill">🤝 Buena Convivencia <strong>+10 CC</strong></div>
            <div class="value-pill">📚 Esfuerzo en Clases <strong>+15 CC</strong></div>
            <div class="value-pill">🌿 Cuidado del Entorno <strong>+10 CC</strong></div>
            <div class="value-pill">⏰ Puntualidad <strong>+10 CC</strong></div>
            <div class="value-pill">⭐ Ayuda a Compañeros <strong>+10 CC</strong></div>
          </div>
        </div>

        <div class="block-box">
          <h3 class="block-title amber">🎁 En la Tienda Escolar Encuentras:</h3>
          <div class="pills-list">
            <div class="reward-pill">✏️ Set de Útiles Novedosos</div>
            <div class="reward-pill">🎲 Juegos de Mesa y Recreo</div>
            <div class="reward-pill">🧸 Peluches y Coleccionables</div>
            <div class="reward-pill">🎖️ Diplomas de Reconocimiento</div>
            <div class="reward-pill">👑 Privilegios de Convivencia</div>
          </div>
        </div>
      </div>

      <!-- 6. PIE INSTITUCIONAL -->
      <div class="poster-footer">
        <div class="footer-callout">
          <div class="footer-badge-icon">🛡️</div>
          <div class="footer-text">
            <h4>¡Cuida tu Tarjeta Colegual!</h4>
            <p>Es personal, única e intransferible. Consérvala siempre en buen estado para tus clases.</p>
          </div>
        </div>
        <div class="footer-credits">
          <p>🌟 Recurso pedagógico impulsado por la</p>
          <p><strong>Coordinadora de Vida Escolar: Janine Díaz Calixto</strong></p>
          <p>Escuela Rural Colegual • Llanquihue</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const tempHtmlPath = path.join(ROOT_DIR, 'data/temp_afiche.html');
  fs.writeFileSync(tempHtmlPath, posterHtml, 'utf-8');

  console.log('📸 Renderizando Afiche en alta resolución con Google Chrome...');
  const cmd = `"${CHROME_BIN}" --headless --disable-gpu --hide-scrollbars --window-size=1200,1700 --force-device-scale-factor=2 --screenshot="${OUTPUT_PNG}" "file://${tempHtmlPath}"`;
  execSync(cmd, { stdio: 'pipe' });

  // Copiar a public para que esté accesible vía web también
  fs.copyFileSync(OUTPUT_PNG, OUTPUT_PUBLIC_PNG);

  // Limpiar temporal HTML
  try {
    fs.unlinkSync(tempHtmlPath);
  } catch {}

  const stats = fs.statSync(OUTPUT_PNG);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ [ÉXITO] Afiche promocional generado:`);
  console.log(`   📁 ${OUTPUT_PNG} (${sizeMb} MB)`);
  console.log(`   🌐 ${OUTPUT_PUBLIC_PNG}`);
}

main().catch(err => {
  console.error('❌ Error generando afiche:', err);
  process.exit(1);
});

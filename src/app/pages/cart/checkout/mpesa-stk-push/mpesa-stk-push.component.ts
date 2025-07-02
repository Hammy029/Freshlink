import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timer, takeWhile } from 'rxjs';
import { MpesaService } from '../mpesa.service';

@Component({
  selector: 'app-mpesa-stk-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Glassmorphism Dark Modal Overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 payment-terminal-overlay"
      (click)="onOverlayClick($event)"
    >
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
      </div>

      <!-- Main Payment Terminal -->
      <div
        class="payment-terminal-container"
        (click)="$event.stopPropagation()"
      >
        <!-- Terminal Header -->
        <div class="terminal-header">
          <div class="terminal-header-content">
            <div class="terminal-brand">
              <div class="brand-icon">
                <div class="mpesa-logo">
                  <div class="logo-m">M</div>
                  <div class="logo-dash">-</div>
                  <div class="logo-pesa">PESA</div>
                </div>
              </div>
              <div class="payment-label">
                <span class="payment-type">MOBILE PAYMENT</span>
                <span class="terminal-id">TERMINAL #{{ getTerminalId() }}</span>
              </div>
            </div>
            <button
              *ngIf="!isProcessing"
              (click)="closeModal()"
              class="terminal-close"
            >
              <div class="close-icon"></div>
            </button>
          </div>
        </div>

        <!-- Payment Display Screen -->
        <div class="payment-screen">
          <!-- Transaction Summary Card -->
          <div class="transaction-card">
            <div class="card-header">
              <span class="transaction-label">TRANSACTION SUMMARY</span>
            </div>
            <div class="transaction-details">
              <div class="detail-row">
                <span class="detail-label">PHONE</span>
                <span class="detail-value">{{
                  formatPhoneForDisplay(phoneNumber)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">AMOUNT</span>
                <span class="detail-value amount"
                  >KSh {{ amount | number }}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">REF</span>
                <span class="detail-value">{{ accountReference }}</span>
              </div>
            </div>
          </div>

          <!-- Status Display -->
          <div class="status-display">
            <!-- Idle State -->
            <div *ngIf="transactionStatus === 'idle'" class="status-content">
              <div class="status-icon-container">
                <div class="phone-icon">
                  <div class="phone-screen"></div>
                  <div class="phone-signal signal-1"></div>
                  <div class="phone-signal signal-2"></div>
                  <div class="phone-signal signal-3"></div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title">Ready to Initialize</h3>
                <p class="status-message">
                  Tap to send M-Pesa request to your device
                </p>
              </div>

              <!-- Payment Instructions -->
              <div class="instruction-panel">
                <div class="instruction-header">
                  <div class="instruction-icon">⚡</div>
                  <span>QUICK SETUP</span>
                </div>
                <div class="instruction-steps">
                  <div class="step">
                    <span class="step-number">01</span>
                    <span class="step-text"
                      >Request sent to
                      {{ formatPhoneForDisplay(phoneNumber) }}</span
                    >
                  </div>
                  <div class="step">
                    <span class="step-number">02</span>
                    <span class="step-text">Check your mobile device</span>
                  </div>
                  <div class="step">
                    <span class="step-number">03</span>
                    <span class="step-text">Enter M-Pesa PIN to confirm</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sending State -->
            <div *ngIf="transactionStatus === 'sending'" class="status-content">
              <div class="status-icon-container">
                <div class="loading-ring">
                  <div class="ring-segment"></div>
                  <div class="ring-segment"></div>
                  <div class="ring-segment"></div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title">Initializing Connection</h3>
                <p class="status-message">
                  Establishing secure payment channel...
                </p>
              </div>
            </div>

            <!-- Checking State -->
            <div
              *ngIf="transactionStatus === 'checking'"
              class="status-content"
            >
              <div class="status-icon-container">
                <div class="pulse-container">
                  <div class="pulse-phone">
                    <div class="phone-body">
                      <div class="phone-notification">{{ timeRemaining }}</div>
                    </div>
                  </div>
                  <div class="pulse-ring pulse-1"></div>
                  <div class="pulse-ring pulse-2"></div>
                  <div class="pulse-ring pulse-3"></div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title">Awaiting Confirmation</h3>
                <p class="status-message">
                  Check your device:
                  <strong>{{ formatPhoneForDisplay(phoneNumber) }}</strong>
                </p>
                <p class="status-sub">
                  Enter your M-Pesa PIN to complete payment
                </p>
              </div>

              <!-- Progress Bar -->
              <div class="progress-container">
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    [style.width.%]="progressPercentage"
                  ></div>
                </div>
                <div class="progress-text">
                  <span>Processing... {{ checkCount }}/{{ maxChecks }}</span>
                  <span>{{ timeRemaining }}s remaining</span>
                </div>
              </div>
            </div>

            <!-- Success State -->
            <div *ngIf="transactionStatus === 'success'" class="status-content">
              <div class="status-icon-container">
                <div class="success-animation">
                  <div class="success-circle">
                    <div class="success-checkmark">
                      <div class="checkmark-stem"></div>
                      <div class="checkmark-kick"></div>
                    </div>
                  </div>
                  <div class="success-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                  </div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title success-title">Payment Confirmed</h3>
                <p class="status-message">Transaction completed successfully</p>
                <p class="transaction-id">Receipt: {{ transactionId }}</p>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="transactionStatus === 'failed'" class="status-content">
              <div class="status-icon-container">
                <div class="error-animation">
                  <div class="error-circle">
                    <div class="error-cross">
                      <div class="cross-line-1"></div>
                      <div class="cross-line-2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title error-title">Transaction Failed</h3>
                <p class="status-message">
                  {{ statusMessage || 'Payment could not be processed' }}
                </p>
              </div>
            </div>

            <!-- Timeout State -->
            <div *ngIf="transactionStatus === 'timeout'" class="status-content">
              <div class="status-icon-container">
                <div class="timeout-animation">
                  <div class="timeout-clock">
                    <div class="clock-face">
                      <div class="clock-hand"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="status-text">
                <h3 class="status-title timeout-title">Session Expired</h3>
                <p class="status-message">Payment request has timed out</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminal Controls -->
        <div class="terminal-controls">
          <!-- Primary Action Button -->
          <button
            *ngIf="transactionStatus === 'idle'"
            (click)="initiatePayment()"
            class="control-button primary-action"
          >
            <div class="button-content">
              <div class="button-icon">⚡</div>
              <span class="button-text">INITIALIZE PAYMENT</span>
            </div>
          </button>

          <!-- Retry Button -->
          <button
            *ngIf="
              transactionStatus === 'failed' || transactionStatus === 'timeout'
            "
            (click)="retryPayment()"
            class="control-button retry-action"
          >
            <div class="button-content">
              <div class="button-icon">🔄</div>
              <span class="button-text">RETRY PAYMENT</span>
            </div>
          </button>

          <!-- Continue Button -->
          <button
            *ngIf="transactionStatus === 'success'"
            (click)="closeModal()"
            class="control-button success-action"
          >
            <div class="button-content">
              <div class="button-icon">✓</div>
              <span class="button-text">CONTINUE</span>
            </div>
          </button>

          <!-- Cancel Button -->
          <button
            *ngIf="
              transactionStatus !== 'checking' &&
              transactionStatus !== 'sending'
            "
            (click)="closeModal()"
            class="control-button cancel-action"
          >
            <div class="button-content">
              <span class="button-text">{{
                transactionStatus === 'success' ? 'CLOSE' : 'CANCEL'
              }}</span>
            </div>
          </button>
        </div>

        <!-- Terminal Footer -->
        <div class="terminal-footer">
          <div class="security-badge">
            <div class="shield-icon">🛡️</div>
            <span>256-BIT ENCRYPTED</span>
          </div>
          <div class="powered-by">
            <span>POWERED BY SAFARICOM</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Glassmorphism Dark Payment Terminal Theme */
      .payment-terminal-overlay {
        background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
        backdrop-filter: blur(20px);
        animation: overlayFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes overlayFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Floating Background Orbs */
      .floating-orb {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
        animation: float 20s infinite ease-in-out;
      }

      .orb-1 {
        width: 300px;
        height: 300px;
        background: linear-gradient(45deg, #8b5cf6, #06b6d4);
        top: 10%;
        left: 20%;
        animation-delay: 0s;
      }

      .orb-2 {
        width: 200px;
        height: 200px;
        background: linear-gradient(45deg, #ec4899, #8b5cf6);
        top: 60%;
        right: 15%;
        animation-delay: -7s;
      }

      .orb-3 {
        width: 150px;
        height: 150px;
        background: linear-gradient(45deg, #06b6d4, #10b981);
        bottom: 20%;
        left: 60%;
        animation-delay: -14s;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0px) scale(1);
        }
        50% {
          transform: translateY(-30px) scale(1.1);
        }
      }

      /* Main Payment Terminal Container */
      .payment-terminal-container {
        width: 420px;
        max-width: 95vw;
        background: rgba(20, 20, 30, 0.95);
        backdrop-filter: blur(30px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 24px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7),
          0 0 0 1px rgba(139, 92, 246, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        animation: terminalSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      @keyframes terminalSlideIn {
        from {
          transform: translateY(30px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      /* Terminal Header */
      .terminal-header {
        padding: 20px 24px 16px;
        background: linear-gradient(
          135deg,
          rgba(139, 92, 246, 0.1) 0%,
          rgba(99, 102, 241, 0.1) 100%
        );
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      }

      .terminal-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .terminal-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .brand-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mpesa-logo {
        display: flex;
        align-items: center;
        font-family: 'SF Pro Display', -apple-system, sans-serif;
        font-weight: 900;
        font-size: 18px;
        color: #ffffff;
      }

      .logo-m {
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .logo-dash {
        color: #6b7280;
        margin: 0 2px;
      }

      .logo-pesa {
        color: #e5e7eb;
      }

      .payment-label {
        display: flex;
        flex-direction: column;
      }

      .payment-type {
        font-size: 11px;
        font-weight: 700;
        color: #8b5cf6;
        letter-spacing: 1.5px;
      }

      .terminal-id {
        font-size: 9px;
        color: #6b7280;
        font-family: 'SF Mono', monospace;
        letter-spacing: 0.5px;
      }

      .terminal-close {
        width: 32px;
        height: 32px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .terminal-close:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.05);
      }

      .close-icon {
        width: 12px;
        height: 12px;
        position: relative;
      }

      .close-icon::before,
      .close-icon::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        background: #ef4444;
        top: 50%;
        left: 0;
      }

      .close-icon::before {
        transform: rotate(45deg);
      }

      .close-icon::after {
        transform: rotate(-45deg);
      }

      /* Payment Screen */
      .payment-screen {
        padding: 24px;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Transaction Card */
      .transaction-card {
        background: rgba(139, 92, 246, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 16px;
        overflow: hidden;
      }

      .card-header {
        padding: 12px 16px;
        background: rgba(139, 92, 246, 0.1);
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      }

      .transaction-label {
        font-size: 10px;
        font-weight: 700;
        color: #8b5cf6;
        letter-spacing: 1px;
      }

      .transaction-details {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .detail-label {
        font-size: 11px;
        color: #9ca3af;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 13px;
        color: #e5e7eb;
        font-weight: 600;
        font-family: 'SF Mono', monospace;
      }

      .detail-value.amount {
        color: #10b981;
        font-size: 16px;
        font-weight: 700;
      }

      /* Status Display */
      .status-display {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .status-content {
        text-align: center;
        width: 100%;
      }

      .status-icon-container {
        margin-bottom: 24px;
        display: flex;
        justify-content: center;
      }

      .status-text {
        margin-bottom: 20px;
      }

      .status-title {
        font-size: 18px;
        font-weight: 700;
        color: #e5e7eb;
        margin-bottom: 8px;
      }

      .status-title.success-title {
        color: #10b981;
      }

      .status-title.error-title {
        color: #ef4444;
      }

      .status-title.timeout-title {
        color: #f59e0b;
      }

      .status-message {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.5;
      }

      .status-sub {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }

      .transaction-id {
        font-size: 12px;
        color: #8b5cf6;
        font-family: 'SF Mono', monospace;
        margin-top: 8px;
      }

      /* Phone Icon Animation */
      .phone-icon {
        width: 80px;
        height: 80px;
        position: relative;
        background: linear-gradient(135deg, #374151, #4b5563);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }

      .phone-screen {
        width: 50px;
        height: 65px;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        border-radius: 8px;
        position: relative;
        animation: phoneGlow 2s ease-in-out infinite;
      }

      @keyframes phoneGlow {
        0%,
        100% {
          opacity: 0.7;
        }
        50% {
          opacity: 1;
        }
      }

      .phone-signal {
        position: absolute;
        width: 4px;
        background: #10b981;
        border-radius: 2px;
        right: -20px;
        animation: signalBars 1.5s ease-in-out infinite;
      }

      .signal-1 {
        height: 8px;
        bottom: 20px;
        animation-delay: 0s;
      }
      .signal-2 {
        height: 16px;
        bottom: 20px;
        right: -14px;
        animation-delay: 0.2s;
      }
      .signal-3 {
        height: 24px;
        bottom: 20px;
        right: -8px;
        animation-delay: 0.4s;
      }

      @keyframes signalBars {
        0%,
        100% {
          opacity: 0.3;
        }
        50% {
          opacity: 1;
        }
      }

      /* Loading Ring */
      .loading-ring {
        width: 80px;
        height: 80px;
        position: relative;
        margin: 0 auto;
      }

      .ring-segment {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 3px solid transparent;
        border-radius: 50%;
        animation: ringRotate 2s linear infinite;
      }

      .ring-segment:nth-child(1) {
        border-top-color: #8b5cf6;
        animation-delay: 0s;
      }

      .ring-segment:nth-child(2) {
        border-right-color: #06b6d4;
        animation-delay: 0.3s;
      }

      .ring-segment:nth-child(3) {
        border-bottom-color: #10b981;
        animation-delay: 0.6s;
      }

      @keyframes ringRotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Pulse Animation */
      .pulse-container {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto;
      }

      .pulse-phone {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        z-index: 10;
      }

      .phone-body {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        border-radius: 8px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .phone-notification {
        color: white;
        font-weight: 700;
        font-size: 12px;
        animation: notificationPulse 1s ease-in-out infinite;
      }

      @keyframes notificationPulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      .pulse-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        border: 2px solid #8b5cf6;
        border-radius: 50%;
        animation: pulseExpand 2s ease-out infinite;
      }

      .pulse-1 {
        width: 60px;
        height: 60px;
        margin: -30px 0 0 -30px;
        animation-delay: 0s;
      }

      .pulse-2 {
        width: 80px;
        height: 80px;
        margin: -40px 0 0 -40px;
        animation-delay: 0.7s;
      }

      .pulse-3 {
        width: 100px;
        height: 100px;
        margin: -50px 0 0 -50px;
        animation-delay: 1.4s;
      }

      @keyframes pulseExpand {
        0% {
          transform: scale(0.8);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }

      /* Progress Bar */
      .progress-container {
        margin-top: 20px;
      }

      .progress-track {
        height: 4px;
        background: rgba(139, 92, 246, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #8b5cf6, #06b6d4);
        border-radius: 2px;
        transition: width 0.5s ease;
        position: relative;
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        animation: progressShimmer 2s ease-in-out infinite;
      }

      @keyframes progressShimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .progress-text {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #6b7280;
      }

      /* Success Animation */
      .success-animation {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto;
      }

      .success-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: successBounce 0.6s ease-out;
      }

      @keyframes successBounce {
        0% {
          transform: scale(0);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }

      .success-checkmark {
        width: 30px;
        height: 30px;
        position: relative;
      }

      .checkmark-stem,
      .checkmark-kick {
        position: absolute;
        background: white;
        border-radius: 2px;
      }

      .checkmark-stem {
        width: 3px;
        height: 15px;
        transform: rotate(45deg);
        left: 18px;
        top: 8px;
        animation: checkmarkStem 0.3s ease-out 0.1s both;
      }

      .checkmark-kick {
        width: 3px;
        height: 8px;
        transform: rotate(-45deg);
        left: 13px;
        top: 15px;
        animation: checkmarkKick 0.2s ease-out 0.2s both;
      }

      @keyframes checkmarkStem {
        0% {
          height: 0;
        }
        100% {
          height: 15px;
        }
      }

      @keyframes checkmarkKick {
        0% {
          height: 0;
        }
        100% {
          height: 8px;
        }
      }

      .success-particles {
        position: absolute;
        inset: 0;
      }

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #10b981;
        border-radius: 50%;
        animation: particleFloat 1s ease-out;
      }

      .particle:nth-child(1) {
        top: 20%;
        left: 20%;
        animation-delay: 0.5s;
      }

      .particle:nth-child(2) {
        top: 20%;
        right: 20%;
        animation-delay: 0.7s;
      }

      .particle:nth-child(3) {
        bottom: 20%;
        left: 50%;
        animation-delay: 0.9s;
      }

      @keyframes particleFloat {
        0% {
          transform: translateY(0) scale(0);
          opacity: 1;
        }
        100% {
          transform: translateY(-20px) scale(1);
          opacity: 0;
        }
      }

      /* Error Animation */
      .error-animation {
        width: 80px;
        height: 80px;
        margin: 0 auto;
      }

      .error-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: errorShake 0.5s ease-out;
      }

      @keyframes errorShake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-5px);
        }
        75% {
          transform: translateX(5px);
        }
      }

      .error-cross {
        width: 30px;
        height: 30px;
        position: relative;
      }

      .cross-line-1,
      .cross-line-2 {
        position: absolute;
        width: 20px;
        height: 3px;
        background: white;
        border-radius: 2px;
        top: 50%;
        left: 50%;
      }

      .cross-line-1 {
        transform: translate(-50%, -50%) rotate(45deg);
        animation: crossLine1 0.3s ease-out 0.2s both;
      }

      .cross-line-2 {
        transform: translate(-50%, -50%) rotate(-45deg);
        animation: crossLine2 0.3s ease-out 0.4s both;
      }

      @keyframes crossLine1 {
        0% {
          width: 0;
        }
        100% {
          width: 20px;
        }
      }

      @keyframes crossLine2 {
        0% {
          width: 0;
        }
        100% {
          width: 20px;
        }
      }

      /* Timeout Animation */
      .timeout-animation {
        width: 80px;
        height: 80px;
        margin: 0 auto;
      }

      .timeout-clock {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .clock-face {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        position: relative;
      }

      .clock-hand {
        position: absolute;
        width: 2px;
        height: 15px;
        background: white;
        border-radius: 1px;
        top: 5px;
        left: 50%;
        transform-origin: 50% 100%;
        transform: translateX(-50%) rotate(0deg);
        animation: clockTick 2s linear infinite;
      }

      @keyframes clockTick {
        0% {
          transform: translateX(-50%) rotate(0deg);
        }
        100% {
          transform: translateX(-50%) rotate(360deg);
        }
      }

      /* Instruction Panel */
      .instruction-panel {
        background: rgba(99, 102, 241, 0.05);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
        padding: 16px;
        margin-top: 20px;
      }

      .instruction-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .instruction-icon {
        font-size: 14px;
      }

      .instruction-header span {
        font-size: 10px;
        font-weight: 700;
        color: #6366f1;
        letter-spacing: 1px;
      }

      .instruction-steps {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .step {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .step-number {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .step-text {
        font-size: 12px;
        color: #d1d5db;
      }

      /* Terminal Controls */
      .terminal-controls {
        padding: 20px 24px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(139, 92, 246, 0.2);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .control-button {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .control-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .primary-action {
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        color: white;
      }

      .primary-action:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      }

      .retry-action {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .retry-action:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
      }

      .success-action {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }

      .success-action:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }

      .cancel-action {
        background: rgba(75, 85, 99, 0.3);
        border: 1px solid rgba(107, 114, 128, 0.5);
        color: #9ca3af;
      }

      .cancel-action:hover:not(:disabled) {
        background: rgba(75, 85, 99, 0.5);
        color: #e5e7eb;
      }

      .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 100%;
      }

      .button-icon {
        font-size: 16px;
      }

      .button-text {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      /* Terminal Footer */
      .terminal-footer {
        padding: 16px 24px;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(139, 92, 246, 0.1);
      }

      .security-badge,
      .powered-by {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 9px;
        color: #6b7280;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .shield-icon {
        font-size: 12px;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .payment-terminal-container {
          width: 100%;
          margin: 0 10px;
          border-radius: 20px;
        }

        .terminal-header {
          padding: 16px 20px 12px;
        }

        .payment-screen {
          padding: 20px;
          min-height: 350px;
        }

        .terminal-controls {
          padding: 16px 20px;
        }
      }
    `,
  ],
})
export class MpesaStkModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() phoneNumber = '';
  @Input() amount = 0;
  @Input() accountReference = '';
  @Input() description = '';

  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentFailed = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  // Transaction states
  transactionStatus:
    | 'idle'
    | 'sending'
    | 'success'
    | 'checking'
    | 'failed'
    | 'timeout' = 'idle';

  checkoutRequestId = '';
  transactionId = '';
  statusMessage = '';

  // Timer management
  private timerSubscription?: Subscription;
  checkCount = 0;
  maxChecks = 12; // Check for 1 minute (5s intervals)
  timeRemaining = 60; // 1 minute countdown
  progressPercentage = 0;

  // Cleanup flag
  private isDestroyed = false;

  isProcessing = false;
  transactionData: any = null;

  constructor(private mpesaService: MpesaService) {}

  ngOnInit() {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['isOpen'] &&
      changes['isOpen'].currentValue &&
      !changes['isOpen'].previousValue
    ) {
      this.resetState();
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.cleanup();
  }

  private resetState() {
    this.transactionStatus = 'idle';
    this.checkoutRequestId = '';
    this.transactionId = '';
    this.statusMessage = '';
    this.checkCount = 0;
    this.timeRemaining = 60;
    this.progressPercentage = 0;
    this.isProcessing = false;
    this.transactionData = null;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  getTerminalId(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  initiatePayment() {
    console.log('🚀 STK Push initiated');

    this.transactionStatus = 'sending';
    this.isProcessing = true;
    this.statusMessage = 'Establishing secure connection...';

    const paymentData = {
      phoneNumber: this.phoneNumber,
      amount: this.amount,
      accountReference: this.accountReference,
      description: this.description,
      clientId: '6862bf4011365af6a4059691',
    };

    console.log('📱 Payment data:', paymentData);

    this.mpesaService.initiateSTKPush(paymentData).subscribe({
      next: (response) => {
        console.log('✅ STK Push Response:', response);

        if (response.success && response.data?.checkoutRequestId) {
          this.checkoutRequestId = response.data.checkoutRequestId;
          this.transactionId = response.data.transactionId || '';
          this.transactionStatus = 'checking';
          this.statusMessage =
            'Request sent! Please check your phone to complete the payment.';

          this.startCheckingStatus();

          console.log(
            '✅ STK Push successful, CheckoutRequestId:',
            this.checkoutRequestId
          );
        } else {
          this.handleError(
            response.data?.responseDescription ||
              response.message ||
              'Failed to send payment request. Please try again.'
          );
        }
      },
      error: (error) => {
        console.error('❌ STK Push Error:', error);
        this.handleError(
          'Error: ' + (error.message || 'Failed to connect to payment service')
        );
      },
    });
  }

  private startCheckingStatus(): void {
    this.checkCount = 0;
    this.timeRemaining = 60;

    this.cleanup();

    this.timerSubscription = timer(5000, 5000)
      .pipe(
        takeWhile(() => {
          return (
            !this.isDestroyed &&
            this.checkCount < this.maxChecks &&
            this.transactionStatus === 'checking'
          );
        }, true)
      )
      .subscribe({
        next: () => {
          if (!this.isDestroyed && this.transactionStatus === 'checking') {
            this.checkTransactionStatus();
            this.timeRemaining = Math.max(0, 60 - this.checkCount * 5);
            this.progressPercentage = (this.checkCount / this.maxChecks) * 100;
          }
        },
        complete: () => {
          this.cleanup();
        },
      });
  }

  private checkTransactionStatus(): void {
    if (this.isDestroyed || this.transactionStatus !== 'checking') {
      return;
    }

    this.checkCount++;

    this.mpesaService.checkTransactionStatus(this.checkoutRequestId).subscribe({
      next: (response) => {
        console.log('📊 Transaction Status Response:', response);

        if (this.transactionStatus !== 'checking' || this.isDestroyed) {
          return;
        }

        if (response.success) {
          this.transactionData = response.data;

          const status = response.data?.status;
          const resultCode = response.data?.resultCode;

          if (
            status === 'completed' ||
            resultCode === 0 ||
            resultCode === '0'
          ) {
            this.handleSuccess();
          } else if (
            status === 'failed' ||
            (resultCode &&
              resultCode !== 0 &&
              resultCode !== '0' &&
              resultCode !== 1032)
          ) {
            this.handleError(
              response.data?.resultDesc || 'Payment failed: Unknown error'
            );
          } else if (this.checkCount >= this.maxChecks) {
            this.handleTimeout();
          }
        } else if (this.checkCount >= this.maxChecks) {
          this.handleTimeout();
        }
      },
      error: (error) => {
        console.error('❌ Status Check Error:', error);
        if (
          this.checkCount >= this.maxChecks &&
          this.transactionStatus === 'checking'
        ) {
          this.handleError(
            'Error checking payment status. Please contact support if payment was made.'
          );
        }
      },
    });
  }

  private handleSuccess(): void {
    console.log('✅ Payment successful');

    this.cleanup();

    this.transactionStatus = 'success';
    this.statusMessage = 'Payment completed successfully!';
    this.isProcessing = false;

    this.transactionId =
      this.transactionData?.mpesaReceiptNumber ||
      this.transactionData?.MpesaReceiptNumber ||
      this.transactionId ||
      'N/A';

    const successData = {
      MpesaReceiptNumber: this.transactionId,
      TransactionDate:
        this.transactionData?.transactionDate || new Date().toISOString(),
      Amount: this.amount,
      PhoneNumber: this.phoneNumber,
      success: true,
      data: this.transactionData,
      checkoutRequestId: this.checkoutRequestId,
    };

    this.paymentSuccess.emit(successData);
  }

  private handleError(message: string): void {
    console.error('❌ Payment error:', message);

    this.cleanup();

    this.transactionStatus = 'failed';
    this.statusMessage = message;
    this.isProcessing = false;

    this.paymentFailed.emit(message);
  }

  private handleTimeout(): void {
    console.warn('⏰ Payment timeout');

    this.cleanup();

    this.transactionStatus = 'timeout';
    this.statusMessage =
      "Please check your phone. We'll notify you when payment completes.";
    this.isProcessing = false;

    this.paymentFailed.emit('Payment request timed out');
  }

  retryPayment(): void {
    console.log('🔄 Retrying payment');
    this.resetState();
    this.initiatePayment();
  }

  closeModal(): void {
    if (this.transactionStatus === 'success') {
      this.modalClosed.emit();
    } else {
      console.log('🚪 Closing modal');
      this.cleanup();
      this.modalClosed.emit();
    }
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget && !this.isProcessing) {
      this.closeModal();
    }
  }

  formatPhoneForDisplay(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return `+${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    }
    return phoneNumber;
  }
}

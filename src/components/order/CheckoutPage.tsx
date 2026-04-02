import { useState } from 'react';
import { useCartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
import { COMMISSION_RATE, calculateCommission, calculateSettlement } from '../../utils/commission';
import { mockBakeries } from '../../mock/bakeries';
import {
  requestPayment, mapPaymentMethod, generateOrderId, isPortOneConfigured,
} from '../../services/paymentService';
import './CheckoutPage.css';

type CheckoutStep = 'summary' | 'payment' | 'done';

const PAYMENT_METHODS = [
  { id: 'kakao', label: '카카오페이', icon: '💛', color: '#FFE812', textColor: '#3C1E1E' },
  { id: 'naver', label: '네이버페이', icon: '🟢', color: '#03C75A', textColor: '#fff' },
  { id: 'card',  label: '신용카드',   icon: '💳', color: '#2563EB', textColor: '#fff' },
  { id: 'toss',  label: '토스페이',   icon: '🔵', color: '#0064FF', textColor: '#fff' },
];

interface Props {
  onClose: () => void;
}

export default function CheckoutPage({ onClose }: Props) {
  const { items, bakeryId, total, clearCart } = useCartContext();
  const { user } = useAuth();
  const [step, setStep]                     = useState<CheckoutStep>('summary');
  const [selectedPayment, setSelectedPayment] = useState<string>('kakao');
  const [orderNote, setOrderNote]           = useState('');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [pickupTime, setPickupTime]         = useState('바로 수령');
  const [paymentError, setPaymentError]     = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string>('');
  const [completedPaymentId, setCompletedPaymentId] = useState<string>('');

  const bakery = mockBakeries.find(b => b.id === bakeryId);
  const finalTotal = total;  // 소비자 수수료 없음

  // 매장 정산 정보 (판매자 수수료 10%)
  const commission = calculateCommission(total);
  const settlement = calculateSettlement(total);

  const isDemo = !isPortOneConfigured();
  const isRegistered = bakery?.isRegistered ?? false;

  const PICKUP_OPTIONS = ['바로 수령', '30분 후', '1시간 후', '오늘 내 원하는 시간'];

  // ── 결제 처리 (PortOne SDK) ──────────────────────────────
  async function handlePayment() {
    if (!isRegistered) return;

    setIsProcessing(true);
    setPaymentError(null);

    const orderId = generateOrderId();
    const orderName = items.length === 1
      ? items[0].name
      : `${items[0].name} 외 ${items.length - 1}건`;

    const methodConfig = mapPaymentMethod(selectedPayment);
    const result = await requestPayment({
      orderId,
      orderName,
      totalAmount: finalTotal,
      ...methodConfig,
      // DB 저장용 추가 파라미터
      userId:    user?.id,
      bakeryId:  bakeryId || '',
      items,
      subtotal:  total,
      pickupTime,
      memo:      orderNote,
      payMethod: methodConfig.payMethod,
      easyPayProvider: methodConfig.easyPayProvider,
    });

    setIsProcessing(false);

    if (result.success) {
      setCompletedOrderId(result.orderId || orderId);
      setCompletedPaymentId(result.paymentId || '');
      setStep('done');
      clearCart();
    } else {
      setPaymentError(result.error || '결제에 실패했습니다.');
    }
  }

  // ── 입점 매장이 아닌 경우 ───────────────────────────────
  if (!isRegistered) {
    return (
      <div className="checkout-overlay" onClick={onClose}>
        <div className="checkout-sheet" onClick={e => e.stopPropagation()}>
          <div className="checkout-header">
            <div />
            <h2 className="checkout-title">결제 불가</h2>
            <button className="checkout-close" onClick={onClose}>✕</button>
          </div>
          <div className="checkout-body">
            <div className="checkout-blocked">
              <div className="blocked-icon">🔒</div>
              <h3 className="blocked-title">입점 매장에서만 결제가 가능합니다</h3>
              <p className="blocked-desc">
                현재 이 매장은 빵맵 입점 매장이 아닙니다.<br/>
                입점 매장에서만 포장주문 및 결제가 가능합니다.
              </p>
              <div className="blocked-info">
                <div className="blocked-info-row">
                  <span>매장명</span>
                  <span>{bakery?.name}</span>
                </div>
                <div className="blocked-info-row">
                  <span>상태</span>
                  <span className="blocked-status">미입점</span>
                </div>
              </div>
              <button className="blocked-close-btn" onClick={onClose}>확인</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-sheet" onClick={e => e.stopPropagation()}>

        {/* ─ 헤더 ─ */}
        <div className="checkout-header">
          {step !== 'done' ? (
            <button
              className="checkout-back"
              onClick={step === 'payment' ? () => setStep('summary') : onClose}
            >‹</button>
          ) : <div />}
          <h2 className="checkout-title">
            {step === 'summary' && '주문 확인'}
            {step === 'payment' && '결제'}
            {step === 'done'    && '주문 완료'}
          </h2>
          <button className="checkout-close" onClick={onClose}>✕</button>
        </div>

        {/* ── 스텝 인디케이터 ── */}
        {step !== 'done' && (
          <div className="checkout-steps">
            <div className={`checkout-step ${step === 'summary' ? 'active' : 'completed'}`}>
              <span className="step-dot">{step === 'summary' ? '1' : '✓'}</span>
              <span className="step-label">주문확인</span>
            </div>
            <div className="step-line" />
            <div className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>
              <span className="step-dot">2</span>
              <span className="step-label">결제</span>
            </div>
          </div>
        )}

        {/* 데모 모드 배지 */}
        {isDemo && step !== 'done' && (
          <div className="demo-badge">
            🧪 테스트 모드 — PortOne 연동 시 실제 결제가 진행됩니다
          </div>
        )}

        <div className="checkout-body">

          {/* ══ STEP 1: 주문 확인 ══ */}
          {step === 'summary' && (
            <>
              {/* 매장 정보 */}
              <div className="checkout-bakery">
                <div className="checkout-bakery-icon">🏠</div>
                <div>
                  <div className="checkout-bakery-name">
                    {bakery?.name ?? '매장'}
                    <span className="checkout-registered-badge">✓ 입점</span>
                  </div>
                  <div className="checkout-bakery-addr">{bakery?.address ?? ''}</div>
                </div>
              </div>

              {/* 주문 목록 */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">주문 내역</h3>
                <div className="checkout-items">
                  {items.map(item => (
                    <div key={item.menuItemId} className="checkout-item">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">×{item.quantity}</span>
                      <span className="checkout-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수령 시간 */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">수령 시간</h3>
                <div className="pickup-options">
                  {PICKUP_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      className={`pickup-btn ${pickupTime === opt ? 'active' : ''}`}
                      onClick={() => setPickupTime(opt)}
                    >{opt}</button>
                  ))}
                </div>
              </div>

              {/* 요청 사항 */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">요청 사항</h3>
                <textarea
                  className="checkout-note"
                  placeholder="ex. 봉투 따로 담아주세요, 카드 영수증 부탁드려요"
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 금액 요약 */}
              <div className="checkout-price-summary">
                <div className="price-row">
                  <span>주문 금액</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="price-row">
                  <span>소비자 수수료</span>
                  <span className="price-free">무료</span>
                </div>
                <div className="price-row total">
                  <span>최종 결제 금액</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* 매장 정산 안내 (판매자 수수료) */}
              <div className="settlement-notice">
                <div className="settlement-title">매장 정산 안내</div>
                <div className="settlement-row">
                  <span>결제 금액</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                <div className="settlement-row commission">
                  <span>판매 수수료 ({COMMISSION_RATE * 100}%)</span>
                  <span>-{formatPrice(commission)}</span>
                </div>
                <div className="settlement-row result">
                  <span>매장 정산 금액</span>
                  <span>{formatPrice(settlement)}</span>
                </div>
              </div>

              <button className="checkout-next-btn" onClick={() => setStep('payment')}>
                결제하기 →
              </button>
            </>
          )}

          {/* ══ STEP 2: 결제 수단 선택 ══ */}
          {step === 'payment' && (
            <>
              {/* 최종 금액 요약 */}
              <div className="payment-amount-banner">
                <span className="payment-amount-label">결제 금액</span>
                <span className="payment-amount-value">{formatPrice(finalTotal)}</span>
              </div>

              {/* 결제 수단 */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">결제 수단</h3>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      className={`payment-method-btn ${selectedPayment === method.id ? 'active' : ''}`}
                      style={selectedPayment === method.id ? {
                        background: method.color,
                        borderColor: method.color,
                        color: method.textColor,
                      } : {}}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <span className="payment-method-icon">{method.icon}</span>
                      <span className="payment-method-label">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 주문 요약 */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">주문 요약</h3>
                <div className="payment-summary-box">
                  <div className="payment-summary-row">
                    <span>매장</span>
                    <span>{bakery?.name}</span>
                  </div>
                  <div className="payment-summary-row">
                    <span>수령 시간</span>
                    <span>{pickupTime}</span>
                  </div>
                  <div className="payment-summary-row">
                    <span>메뉴 {items.length}종</span>
                    <span>{items.map(i => `${i.name}×${i.quantity}`).join(', ')}</span>
                  </div>
                  {orderNote && (
                    <div className="payment-summary-row">
                      <span>요청사항</span>
                      <span>{orderNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 이용약관 동의 */}
              <p className="checkout-terms">
                결제하기 버튼 클릭 시 <span>이용약관</span> 및 <span>개인정보처리방침</span>에 동의하는 것으로 간주합니다.
              </p>

              {/* 에러 메시지 */}
              {paymentError && (
                <div className="payment-error">
                  <span>⚠️</span> {paymentError}
                </div>
              )}

              <button
                className={`checkout-pay-btn ${isProcessing ? 'processing' : ''}`}
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing
                  ? <><span className="pay-spinner" />결제 처리 중...</>
                  : `${PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label ?? ''}로 ${formatPrice(finalTotal)} 결제`}
              </button>
            </>
          )}

          {/* ══ STEP 3: 완료 ══ */}
          {step === 'done' && (
            <div className="checkout-done">
              <div className="done-icon">✅</div>
              <h3 className="done-title">주문이 완료되었습니다!</h3>
              <p className="done-bakery">{bakery?.name}</p>
              <div className="done-info-box">
                <div className="done-info-row">
                  <span className="done-info-label">주문번호</span>
                  <span className="done-info-value order-id">{completedOrderId}</span>
                </div>
                <div className="done-info-row">
                  <span className="done-info-label">수령 시간</span>
                  <span className="done-info-value">{pickupTime}</span>
                </div>
                <div className="done-info-row">
                  <span className="done-info-label">결제 수단</span>
                  <span className="done-info-value">
                    {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}
                    {isDemo && ' (테스트)'}
                  </span>
                </div>
                <div className="done-info-row">
                  <span className="done-info-label">결제 금액</span>
                  <span className="done-info-value highlight">{formatPrice(finalTotal)}</span>
                </div>
                {completedPaymentId && (
                  <div className="done-info-row">
                    <span className="done-info-label">결제 ID</span>
                    <span className="done-info-value small">{completedPaymentId}</span>
                  </div>
                )}
              </div>
              <p className="done-note">
                🍞 매장에서 준비가 완료되면 알림을 드립니다.<br/>
                방문 시 <strong>주문번호</strong>를 말씀해주세요.
              </p>
              <button className="done-close-btn" onClick={onClose}>확인</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

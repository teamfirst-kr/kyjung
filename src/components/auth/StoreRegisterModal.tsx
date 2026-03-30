import { useState } from 'react';
import './StoreRegisterModal.css';

interface Props {
  onClose: () => void;
}

export default function StoreRegisterModal({ onClose }: Props) {
  const [step, setStep] = useState<'auth' | 'form' | 'done'>('auth');
  const [formPage, setFormPage] = useState(1);
  const [form, setForm] = useState({
    // 기본 정보
    storeName: '',
    category: '베이커리',
    address: '',
    addressDetail: '',
    phone: '',
    // 대표자 정보
    ownerName: '',
    businessNumber: '',
    email: '',
    // 매장 상세
    description: '',
    openHours: '',
    closeHours: '',
    closedDays: [] as string[],
    parkingAvailable: false,
    deliveryAvailable: false,
    takeoutAvailable: true,
    // 메뉴 & 특징
    mainMenus: '',
    priceRange: 'mid',
    specialties: [] as string[],
    // 사진
    photoCount: 0,
  });

  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  const SPECIALTIES = ['천연발효', '비건', '글루텐프리', '유기농', '수제잼', '원두커피', '디저트', '케이크주문제작', '단체주문', '새벽배송'];
  const CATEGORIES = ['베이커리', '제과점', '케이크전문', '베이글전문', '크로와상전문', '식빵전문', '디저트카페', '천연발효빵'];

  function toggleDay(day: string) {
    setForm(p => ({
      ...p,
      closedDays: p.closedDays.includes(day)
        ? p.closedDays.filter(d => d !== day)
        : [...p.closedDays, day],
    }));
  }

  function toggleSpecialty(s: string) {
    setForm(p => ({
      ...p,
      specialties: p.specialties.includes(s)
        ? p.specialties.filter(x => x !== s)
        : [...p.specialties, s],
    }));
  }

  function handleSubmit() {
    if (!form.storeName || !form.address || !form.phone || !form.ownerName || !form.businessNumber) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    setStep('done');
  }

  function updateField(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
  }

  const totalPages = 3;

  return (
    <div className="store-reg-overlay" onClick={onClose}>
      <div className="store-reg-modal store-reg-wide" onClick={e => e.stopPropagation()}>
        <button className="store-reg-close" onClick={onClose}>✕</button>

        {step === 'auth' && (
          <>
            <div className="store-reg-header">
              <span className="store-reg-icon">🏠</span>
              <h2>우리빵집 입점신청</h2>
              <p className="store-reg-subtitle">빵맵에 입점하고 더 많은 고객을 만나보세요!</p>
            </div>

            <div className="store-reg-benefits">
              <div className="benefit-item"><span>📍</span><span>지도에서 매장 홍보</span></div>
              <div className="benefit-item"><span>🛒</span><span>포장주문 접수</span></div>
              <div className="benefit-item"><span>📊</span><span>리뷰/통계 관리</span></div>
              <div className="benefit-item"><span>🔥</span><span>빵 굽는 시간 알림</span></div>
              <div className="benefit-item"><span>📸</span><span>매장 사진 등록</span></div>
              <div className="benefit-item"><span>📢</span><span>이벤트/쿠폰 발행</span></div>
            </div>

            <div className="store-reg-fee-info">
              <h4>수수료 안내</h4>
              <p>포장주문 수수료: 주문금액의 <strong>5%</strong> (판매자 부담)</p>
              <p>입점 등록비: <strong>무료</strong></p>
              <p>프리미엄 광고: 별도 문의</p>
            </div>

            <p className="store-reg-note">사업자 계정으로 로그인해주세요</p>
            <div className="store-auth-buttons">
              <button className="store-auth-btn kakao" onClick={() => setStep('form')}>💬 카카오로 로그인</button>
              <button className="store-auth-btn google" onClick={() => setStep('form')}>G Google로 로그인</button>
              <button className="store-auth-btn naver" onClick={() => setStep('form')}>N 네이버로 로그인</button>
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="store-reg-header">
              <h2>입점 정보 등록</h2>
              <p className="store-reg-subtitle">네이버 플레이스와 동일한 형식으로 매장 정보를 등록하세요</p>
            </div>

            {/* Progress */}
            <div className="form-progress">
              {['기본 정보', '매장 상세', '메뉴 & 사진'].map((label, i) => (
                <div key={i} className={`progress-step ${formPage > i ? 'done' : ''} ${formPage === i + 1 ? 'active' : ''}`}>
                  <span className="progress-num">{i + 1}</span>
                  <span className="progress-label">{label}</span>
                </div>
              ))}
            </div>

            {/* Page 1: Basic Info */}
            {formPage === 1 && (
              <div className="store-form-section">
                <h3 className="form-section-title">📋 기본 정보</h3>
                <div className="store-form-grid">
                  <label className="required">
                    <span>매장명 *</span>
                    <input value={form.storeName} onChange={e => updateField('storeName', e.target.value)} placeholder="예: 행복한 빵집" />
                  </label>
                  <label className="required">
                    <span>업종 카테고리</span>
                    <select value={form.category} onChange={e => updateField('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="full required">
                    <span>매장 주소 *</span>
                    <input value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="예: 서울 강남구 테헤란로 123" />
                  </label>
                  <label className="full">
                    <span>상세 주소</span>
                    <input value={form.addressDetail} onChange={e => updateField('addressDetail', e.target.value)} placeholder="예: 1층 101호" />
                  </label>
                  <label className="required">
                    <span>대표 전화번호 *</span>
                    <input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="02-1234-5678" />
                  </label>
                  <label>
                    <span>이메일</span>
                    <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="bakery@email.com" />
                  </label>

                  <div className="form-divider" />

                  <label className="required">
                    <span>대표자명 *</span>
                    <input value={form.ownerName} onChange={e => updateField('ownerName', e.target.value)} placeholder="대표자 성함" />
                  </label>
                  <label className="required">
                    <span>사업자등록번호 *</span>
                    <input value={form.businessNumber} onChange={e => updateField('businessNumber', e.target.value)} placeholder="000-00-00000" />
                  </label>
                </div>
              </div>
            )}

            {/* Page 2: Store Details */}
            {formPage === 2 && (
              <div className="store-form-section">
                <h3 className="form-section-title">🏠 매장 상세</h3>
                <div className="store-form-grid">
                  <label className="full">
                    <span>매장 소개</span>
                    <textarea
                      value={form.description}
                      onChange={e => updateField('description', e.target.value)}
                      placeholder="매장의 특징, 분위기, 자랑거리를 자유롭게 작성해주세요"
                      rows={3}
                    />
                  </label>
                  <label>
                    <span>영업 시작 시간</span>
                    <input type="time" value={form.openHours} onChange={e => updateField('openHours', e.target.value)} />
                  </label>
                  <label>
                    <span>영업 종료 시간</span>
                    <input type="time" value={form.closeHours} onChange={e => updateField('closeHours', e.target.value)} />
                  </label>
                  <div className="full">
                    <span className="field-label">정기 휴무일</span>
                    <div className="day-selector">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${form.closedDays.includes(day) ? 'selected' : ''}`}
                          onClick={() => toggleDay(day)}
                        >{day}</button>
                      ))}
                    </div>
                  </div>
                  <div className="full">
                    <span className="field-label">편의 시설</span>
                    <div className="facility-checks">
                      <label className="check-label">
                        <input type="checkbox" checked={form.parkingAvailable} onChange={e => updateField('parkingAvailable', e.target.checked)} />
                        <span>🅿️ 주차 가능</span>
                      </label>
                      <label className="check-label">
                        <input type="checkbox" checked={form.deliveryAvailable} onChange={e => updateField('deliveryAvailable', e.target.checked)} />
                        <span>🚚 배달 가능</span>
                      </label>
                      <label className="check-label">
                        <input type="checkbox" checked={form.takeoutAvailable} onChange={e => updateField('takeoutAvailable', e.target.checked)} />
                        <span>🛒 포장 가능</span>
                      </label>
                    </div>
                  </div>
                  <div className="full">
                    <span className="field-label">매장 특징 (다중 선택)</span>
                    <div className="specialty-tags">
                      {SPECIALTIES.map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`specialty-tag ${form.specialties.includes(s) ? 'selected' : ''}`}
                          onClick={() => toggleSpecialty(s)}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: Menu & Photos */}
            {formPage === 3 && (
              <div className="store-form-section">
                <h3 className="form-section-title">🍰 메뉴 & 사진</h3>
                <div className="store-form-grid">
                  <label className="full">
                    <span>대표 메뉴 (쉼표로 구분)</span>
                    <input value={form.mainMenus} onChange={e => updateField('mainMenus', e.target.value)} placeholder="예: 소금빵, 크로와상, 우유식빵, 앙버터" />
                  </label>
                  <label>
                    <span>가격대</span>
                    <select value={form.priceRange} onChange={e => updateField('priceRange', e.target.value)}>
                      <option value="low">저가 (~3,000원)</option>
                      <option value="mid">중간 (3,000~6,000원)</option>
                      <option value="high">고가 (6,000원~)</option>
                    </select>
                  </label>
                  <div className="full">
                    <span className="field-label">매장 사진 업로드</span>
                    <div className="photo-upload-area">
                      <div className="photo-upload-grid">
                        {['매장 외관', '매장 내부', '빵 진열대', '대표 메뉴', '기타'].map((label, i) => (
                          <div key={i} className="photo-upload-slot" onClick={() => setForm(p => ({ ...p, photoCount: p.photoCount + 1 }))}>
                            {i < form.photoCount ? (
                              <div className="photo-uploaded">
                                <span>📸</span>
                                <span className="photo-uploaded-label">업로드됨</span>
                              </div>
                            ) : (
                              <>
                                <span className="photo-upload-icon">+</span>
                                <span className="photo-upload-label">{label}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="photo-upload-hint">* 최소 1장 이상의 매장 사진을 등록해주세요 (권장: 3장 이상)</p>
                    </div>
                  </div>
                </div>

                <div className="store-form-note">
                  <h4>📌 입점 심사 안내</h4>
                  <ul>
                    <li>입점 심사는 영업일 기준 <strong>3~5일</strong> 소요됩니다.</li>
                    <li>사업자등록번호와 매장 정보가 정확해야 승인됩니다.</li>
                    <li>포장주문 수수료는 주문 금액의 <strong>5%</strong>입니다 (판매자 부담).</li>
                    <li>승인 후 매장 정보는 언제든 수정 가능합니다.</li>
                    <li>심사 결과는 등록하신 연락처로 안내됩니다.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="form-nav">
              {formPage > 1 && (
                <button className="form-prev-btn" onClick={() => setFormPage(p => p - 1)}>← 이전</button>
              )}
              <div className="form-page-info">{formPage} / {totalPages}</div>
              {formPage < totalPages ? (
                <button className="form-next-btn" onClick={() => setFormPage(p => p + 1)}>다음 →</button>
              ) : (
                <button className="store-submit-btn" onClick={handleSubmit}>입점 심사 신청하기</button>
              )}
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="store-reg-done">
            <span className="done-icon">✅</span>
            <h2>입점 신청이 완료되었습니다!</h2>
            <p>심사 결과는 등록하신 연락처로 안내드리겠습니다.</p>
            <div className="done-summary">
              <p><strong>매장명:</strong> {form.storeName}</p>
              <p><strong>주소:</strong> {form.address}</p>
              <p><strong>대표자:</strong> {form.ownerName}</p>
              <p><strong>사진:</strong> {form.photoCount}장 첨부</p>
            </div>
            <p className="done-note">영업일 기준 3~5일 내에 결과가 통보됩니다.</p>
            <button className="done-btn" onClick={onClose}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

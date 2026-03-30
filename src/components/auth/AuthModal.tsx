import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

interface Props {
  onClose: () => void;
}

type Mode = 'select' | 'email-login' | 'email-signup';

export default function AuthModal({ onClose }: Props) {
  const { signInWithGoogle, signInWithKakao, signInWithEmail, signUpWithEmail, user, signOut } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<Mode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 경우 — 프로필 표시
  if (user) {
    return (
      <div className="auth-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <button className="auth-close" onClick={onClose}>✕</button>
          <div className="auth-header">
            <span className="auth-logo">{user.avatar_url ? <img src={user.avatar_url} className="auth-avatar-img" alt="" /> : '🍞'}</span>
            <h2>{user.name}</h2>
            <p className="auth-subtitle">{user.email}</p>
            <span className="auth-role-badge">{user.role === 'admin' ? '🛠️ 관리자' : user.role === 'seller' ? '🏠 판매자' : '👤 소비자'}</span>
          </div>
          <button className="auth-btn logout" onClick={async () => { await signOut(); onClose(); }}>
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async () => {
    setError('');
    setLoading(true);
    if (mode === 'email-login') {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error);
      else onClose();
    } else {
      const { error } = await signUpWithEmail(email, password, name);
      if (error) setError(error);
      else { setError(''); setMode('email-login'); alert('가입 확인 이메일을 발송했습니다.'); }
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>
        <div className="auth-header">
          <span className="auth-logo">🍞</span>
          <h2>빵맵 {mode === 'email-signup' ? '회원가입' : mode === 'email-login' ? '로그인' : '시작하기'}</h2>
          <p className="auth-subtitle">
            {mode === 'select' ? 'SNS 계정으로 간편하게 시작하세요' :
             mode === 'email-login' ? '이메일로 로그인' : '이메일로 회원가입'}
          </p>
        </div>

        {/* SNS 로그인 선택 화면 */}
        {mode === 'select' && (
          <>
            <div className="auth-agree">
              <label className="agree-label">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span className="agree-text">이용약관 및 개인정보처리방침에 동의합니다</span>
              </label>
            </div>
            <div className="auth-buttons">
              <button className="auth-btn kakao" disabled={!agreed} onClick={() => { signInWithKakao(); }}>
                <span className="auth-btn-icon">💬</span>카카오로 시작하기
              </button>
              <button className="auth-btn google" disabled={!agreed} onClick={() => { signInWithGoogle(); }}>
                <span className="auth-btn-icon google-g">G</span>Google로 시작하기
              </button>
              <button className="auth-btn naver" disabled={!agreed} onClick={() => { onClose(); }}>
                <span className="auth-btn-icon">N</span>네이버로 시작하기
              </button>
              <div className="auth-divider"><span>또는</span></div>
              <button className="auth-btn email" disabled={!agreed} onClick={() => setMode('email-login')}>
                <span className="auth-btn-icon">✉️</span>이메일로 시작하기
              </button>
            </div>
          </>
        )}

        {/* 이메일 로그인/가입 폼 */}
        {(mode === 'email-login' || mode === 'email-signup') && (
          <div className="auth-email-form">
            {mode === 'email-signup' && (
              <input className="auth-input" type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
            )}
            <input className="auth-input" type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="auth-input" type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn primary" onClick={handleEmailSubmit} disabled={loading}>
              {loading ? '처리 중...' : mode === 'email-login' ? '로그인' : '회원가입'}
            </button>
            <div className="auth-switch">
              {mode === 'email-login' ? (
                <span>계정이 없으신가요? <button onClick={() => setMode('email-signup')}>회원가입</button></span>
              ) : (
                <span>이미 계정이 있으신가요? <button onClick={() => setMode('email-login')}>로그인</button></span>
              )}
            </div>
            <button className="auth-back-btn" onClick={() => setMode('select')}>← 다른 방법으로 로그인</button>
          </div>
        )}

        <p className="auth-footer">가입 시 빵맵의 이용약관과 개인정보처리방침에 동의하게 됩니다.</p>
      </div>
    </div>
  );
}

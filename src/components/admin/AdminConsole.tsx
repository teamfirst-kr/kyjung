import { useState } from 'react';
import AdManager from './AdManager';
import StoreReviewManager from './StoreReviewManager';
import './AdminConsole.css';

type AdminTab = 'ads' | 'stores' | 'dashboard';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <div className="admin-console">
      <div className="admin-header">
        <h2 className="admin-title">🛠️ 관리자 콘솔</h2>
        <p className="admin-subtitle">빵맵 광고 · 입점 · 운영 관리</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 대시보드
        </button>
        <button className={`admin-tab ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
          📢 광고 관리
        </button>
        <button className={`admin-tab ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
          🏠 입점 심사
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'ads' && <AdManager />}
        {activeTab === 'stores' && <StoreReviewManager />}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dash-cards">
        <div className="dash-card">
          <span className="dash-card-icon">🏠</span>
          <div className="dash-card-info">
            <span className="dash-card-value">7</span>
            <span className="dash-card-label">입점 빵집</span>
          </div>
        </div>
        <div className="dash-card">
          <span className="dash-card-icon">📋</span>
          <div className="dash-card-info">
            <span className="dash-card-value">3</span>
            <span className="dash-card-label">심사 대기</span>
          </div>
        </div>
        <div className="dash-card">
          <span className="dash-card-icon">📢</span>
          <div className="dash-card-info">
            <span className="dash-card-value">6</span>
            <span className="dash-card-label">활성 광고</span>
          </div>
        </div>
        <div className="dash-card">
          <span className="dash-card-icon">👥</span>
          <div className="dash-card-info">
            <span className="dash-card-value">1,247</span>
            <span className="dash-card-label">총 회원수</span>
          </div>
        </div>
        <div className="dash-card">
          <span className="dash-card-icon">🛒</span>
          <div className="dash-card-info">
            <span className="dash-card-value">89</span>
            <span className="dash-card-label">금일 주문</span>
          </div>
        </div>
        <div className="dash-card">
          <span className="dash-card-icon">💰</span>
          <div className="dash-card-info">
            <span className="dash-card-value">₩2.4M</span>
            <span className="dash-card-label">월 수수료 수익</span>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <h3>📈 최근 7일 주문 현황</h3>
        <div className="dash-chart">
          {[42, 55, 38, 67, 89, 73, 81].map((v, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div className="chart-bar" style={{ height: `${v}%` }} />
              <span className="chart-label">{['월','화','수','목','금','토','일'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <h3>🔔 최근 알림</h3>
        <div className="dash-alerts">
          <div className="dash-alert">
            <span className="alert-dot new" />
            <span>새 입점 신청: <strong>베이크샵 연남</strong></span>
            <span className="alert-time">10분 전</span>
          </div>
          <div className="dash-alert">
            <span className="alert-dot new" />
            <span>광고 만료 예정: <strong>홈베이킹 밀키트</strong></span>
            <span className="alert-time">1시간 전</span>
          </div>
          <div className="dash-alert">
            <span className="alert-dot" />
            <span>입점 승인 완료: <strong>밀도 종로점</strong></span>
            <span className="alert-time">어제</span>
          </div>
        </div>
      </div>
    </div>
  );
}

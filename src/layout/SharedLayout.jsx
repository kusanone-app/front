// src/layout/SharedLayout.jsx
import { h } from 'preact';
import { Link } from 'wouter';
import './common.css';

export default function SharedLayout({ type, children, onLocate }) {
  const isActivity = type === 'activity';
  const basePath   = isActivity ? '/activity' : '/recruit';

  return (
    <div>
      <header class="header">
        <h1>🌱れいわ草の根プロジェクト</h1>
        <nav class="nav-with-segment">
          {/* セグメント */}
          <div class="segment">
            <Link
              href="/activity/map"
              class={`nav-item ${isActivity ? 'active' : ''}`}
            >
              活動マップ
            </Link>
            <span class="segment-divider">｜</span>
            <Link
              href="/recruit/map"
              class={`nav-item ${!isActivity ? 'active' : ''}`}
            >
              募集マップ
            </Link>
          </div>

          {/* 共通リンク群 */}
          <div class="common-links">
            {isActivity ? (
              <button class="nav-item" onClick={onLocate}>
                現在地
              </button>
            ) : (
              <Link class="nav-item" href={`${basePath}/map`}>
                現在地
              </Link>
            )}
            <Link class="nav-item" href={`${basePath}/form`}>
              新規登録
            </Link>
            <Link class="nav-item" href={`${basePath}/list`}>
              一覧
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

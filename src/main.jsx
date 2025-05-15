import { h, render } from 'preact';
import { Router, Route } from 'wouter';
import { useRef } from 'preact/hooks';

import ActivityLayout from './layout/ActivityLayout.jsx';
import RecruitmentLayout from './layout/RecruitmentLayout.jsx';

import ActivityMap from './pages/activity/Map.jsx';
import ActivityForm from './pages/activity/Form.jsx';
import ActivityList from './pages/activity/List.jsx';

import RecruitmentMap from './pages/recruitment/Map.jsx';
import RecruitmentForm from './pages/recruitment/Form.jsx';
import RecruitmentList from './pages/recruitment/List.jsx';

// ✅ ここで ActivityMapWithLayout を定義
function ActivityMapWithLayout() {
  const mapRef = useRef();

  const handleLocate = () => {
    if (mapRef.current) {
      mapRef.current(); // 地図側の関数を実行
    }
  };

  return (
    <ActivityLayout onLocate={handleLocate}>
      <ActivityMap onReady={(fn) => (mapRef.current = fn)} />
    </ActivityLayout>
  );
}

render(
  <Router>
    {/* ✅ "/" のルートを ActivityMapWithLayout に変更 */}
    <Route path="/" component={ActivityMapWithLayout} />
    <Route path="/activity/map" component={ActivityMapWithLayout} />    
    <Route path="/activity/form" component={() => (
      <ActivityLayout><ActivityForm /></ActivityLayout>
    )} />
    <Route path="/activity/list" component={() => (
      <ActivityLayout><ActivityList /></ActivityLayout>
    )} />
    <Route path="/recruit/map" component={() => (
      <RecruitmentLayout><RecruitmentMap /></RecruitmentLayout>
    )} />
    <Route path="/recruit/form" component={() => (
      <RecruitmentLayout><RecruitmentForm /></RecruitmentLayout>
    )} />
    <Route path="/recruit/list" component={() => (
      <RecruitmentLayout><RecruitmentList /></RecruitmentLayout>
    )} />
  </Router>,
  document.getElementById('app')
);

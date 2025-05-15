import { h } from 'preact';
import SharedLayout from './SharedLayout';

export default function ActivityLayout({ children, onLocate }) {
  return (
    <SharedLayout type="activity" onLocate={onLocate}>
      {children}
    </SharedLayout>
  );
}

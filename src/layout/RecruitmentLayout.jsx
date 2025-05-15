import { h } from 'preact';
import SharedLayout from './SharedLayout';

export default function RecruitmentLayout({ children }) {
  return (
    <SharedLayout type="recruit">
      {children}
    </SharedLayout>
  );
}

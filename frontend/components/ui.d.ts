cat > components/ui.d.ts <<'EOF'
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

export function Shell(props: {
  title: string;
  user?: string;
  onLogout?: () => void;
  children?: ReactNode;
  wide?: boolean;
}): ReactElement;

export function Card(props: { title?: string; children?: ReactNode; className?: string }): ReactElement;

export function Field(props: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
  [key: string]: unknown;
}): ReactElement;

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }
): ReactElement;

export function Alert(props: { kind?: string; children?: ReactNode }): ReactElement | null;
export function Loading(props: { label?: string }): ReactElement;
export function Empty(props: { children?: ReactNode }): ReactElement;

export const LEVEL_STYLE: Record<string, any>;
export const FREQUENCY_AR: Record<string, string>;
export const TRASH_AR: Record<string, string>;
export const STATUS_AR: Record<string, string>;
EOF
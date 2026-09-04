/// <reference types="react" />

import type { LocaleId } from './locale';
import type { RouteId } from './route';

export interface ContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer' | 'nav';
}

export interface StackProps {
  readonly children: React.ReactNode;
  readonly gap?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm' | 'md';
}

export interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly testId?: string;
}

export interface BadgeProps {
  readonly children: React.ReactNode;
  readonly tone?: 'neutral' | 'accent' | 'success';
  readonly className?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
}

export interface ProseProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export interface EmptyStateProps {
  readonly title: string;
  readonly body: string;
  readonly testId?: string;
}

export interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly lead?: string;
  readonly testId?: string;
}

export interface LocaleSwitcherProps {
  readonly className?: string;
}

export interface NavLinkDescriptor {
  readonly routeId: RouteId;
  readonly label: string;
}

export interface RequireAuthProps {
  readonly children: React.ReactElement;
}

export interface LocaleShellProps {
  readonly locale: LocaleId;
}

import { useEffect } from 'react';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function actionFromTarget(target: EventTarget | null): 'authorize' | 'dismiss' | null {
  if (!(target instanceof HTMLElement)) return null;
  const button = target.closest<HTMLButtonElement>('button[data-waiting-action]');
  if (!button) return null;
  const action = button.dataset.waitingAction;
  if (action === 'authorize' || action === 'dismiss') return action;
  return null;
}

interface Options {
  onAuthorize: () => void;
  onDismiss: () => void;
}

/** Enter = confirm focused action (default authorize). Esc = ignore document. */
export function useWaitingKeyboardShortcuts(enabled: boolean, { onAuthorize, onDismiss }: Options) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (actionFromTarget(e.target) === 'dismiss') {
          onDismiss();
        } else {
          onAuthorize();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [enabled, onAuthorize, onDismiss]);
}

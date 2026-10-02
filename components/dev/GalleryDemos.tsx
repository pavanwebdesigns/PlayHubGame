'use client';

import { useState } from 'react';
import { useSiteIcons } from '@/components/icons/IconProvider';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { SearchField } from '@/components/ui/SearchField';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';

export function ButtonLoadingDemo() {
  const icons = useSiteIcons();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      icon={icons.play}
      loading={loading}
      onClick={() => {
        setLoading(true);
        window.setTimeout(() => setLoading(false), 1200);
      }}
    >
      Save
    </Button>
  );
}

export function ChipDemo() {
  const [selected, setSelected] = useState(true);
  return (
    <Chip selected={selected} onClick={() => setSelected((value) => !value)}>
      Puzzle
    </Chip>
  );
}

export function SearchDemo() {
  const [value, setValue] = useState('prism');
  const [empty, setEmpty] = useState('');
  return (
    <div className="grid gap-3">
      <SearchField
        value={value}
        onValueChange={setValue}
        status={value ? `Searching for ${value}` : 'Search is empty'}
      />
      <SearchField
        value={empty}
        onValueChange={setEmpty}
        status={empty ? `Searching for ${empty}` : 'Search is empty'}
      />
    </div>
  );
}

export function OverlayDemos() {
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setSheet(true)}>
        Open categories
      </Button>
      <Button variant="secondary" onClick={() => setDialog(true)}>
        Open dialog
      </Button>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Categories">
        <p>Puzzle, racing, and arcade live here.</p>
        <Button
          className="mt-3"
          variant="secondary"
          onClick={() => setSheet(false)}
        >
          Close
        </Button>
      </Sheet>
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Copy link">
        <p>The link is ready to copy.</p>
        <Button
          className="mt-3"
          variant="secondary"
          onClick={() => setDialog(false)}
        >
          Close
        </Button>
      </Dialog>
    </div>
  );
}

export function InlineSheet() {
  return (
    <div className="overflow-hidden rounded-tile bg-night">
      <Sheet open onClose={() => undefined} title="Category list" mode="inline">
        <p>Puzzle and racing.</p>
      </Sheet>
    </div>
  );
}

export function InlineDialog() {
  return (
    <div className="min-h-64 overflow-hidden rounded-tile bg-night">
      <Dialog open onClose={() => undefined} title="Link ready" mode="inline">
        <p>The link is ready to copy.</p>
      </Dialog>
    </div>
  );
}

export function ToastDemo() {
  const { showToast } = useToast();
  return (
    <Button variant="secondary" onClick={() => showToast('Link copied')}>
      Show toast
    </Button>
  );
}

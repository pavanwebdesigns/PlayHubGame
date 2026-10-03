import { Icon } from '@/components/icons/Icon';
import {
  ButtonLoadingDemo,
  ChipDemo,
  InlineDialog,
  InlineSheet,
  OverlayDemos,
  SearchDemo,
  ToastDemo,
} from '@/components/dev/GalleryDemos';
import { AdSlot } from '@/components/ui/AdSlot';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Prose } from '@/components/ui/Prose';
import { Skeleton } from '@/components/ui/Skeleton';

export function PrimitiveSections() {
  return (
    <>
      <section id="button" className="grid gap-3">
        <h2 className="text-title">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Play</Button>
          <Button variant="secondary">Save</Button>
          <Button variant="ghost">Cancel</Button>
          <Button size="lg" icon={<Icon name="play" />}>
            Play
          </Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <ButtonLoadingDemo />
        </div>
      </section>

      <section id="icon-button" className="grid gap-3">
        <h2 className="text-title">Icon button</h2>
        <IconButton label="Save" icon={<Icon name="heart" />} />
      </section>

      <section id="chip" className="grid gap-3">
        <h2 className="text-title">Chip</h2>
        <div className="flex flex-wrap gap-3">
          <Chip>Arcade</Chip>
          <ChipDemo />
        </div>
      </section>

      <section id="search-field" className="grid gap-3">
        <h2 className="text-title">Search field</h2>
        <SearchDemo />
      </section>

      <section id="sheet" className="grid gap-3">
        <h2 className="text-title">Sheet</h2>
        <OverlayDemos />
        <InlineSheet />
      </section>

      <section id="dialog" className="grid gap-3">
        <h2 className="text-title">Dialog</h2>
        <InlineDialog />
      </section>

      <section id="toast" className="grid gap-3">
        <h2 className="text-title">Toast</h2>
        <ToastDemo />
      </section>

      <section id="skeleton" className="grid gap-3">
        <h2 className="text-title">Skeleton</h2>
        <Skeleton width="100%" aspectRatio={1.6} />
        <Skeleton width={160} height={44} />
      </section>

      <section id="ad-slot" className="grid gap-3">
        <h2 className="text-title">Ad slot</h2>
        <AdSlot minHeight={90} minWidth={280} />
      </section>

      <section id="prose" className="grid gap-3">
        <h2 className="text-title">Prose</h2>
        <Prose>
          <h2>How a write-up sits</h2>
          <p>Body copy stays within a comfortable line length.</p>
          <ul>
            <li>One point</li>
            <li>Another point</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Key</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Jump</td>
                <td>Space</td>
              </tr>
            </tbody>
          </table>
        </Prose>
      </section>
    </>
  );
}

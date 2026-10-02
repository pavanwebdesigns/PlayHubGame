import { CONTACT_EMAIL, SITE_NAME, contactEmailPublished } from '../config/site';

export type InfoView = 'about' | 'privacy' | 'terms' | 'contact';

interface InfoPageProps {
  view: InfoView;
}

const InfoPage = ({ view }: InfoPageProps) => {
  return (
    <article className="container py-4 text-white" style={{ maxWidth: '760px' }}>
      {view === 'about' && <About />}
      {view === 'privacy' && <Privacy />}
      {view === 'terms' && <Terms />}
      {view === 'contact' && <Contact />}
    </article>
  );
};

const About = () => (
  <>
    <h1 className="mb-3">About</h1>
    <p>
      {SITE_NAME} is a free site for playing browser games. The games are embedded from GamePix.
      We do not host the game files ourselves.
    </p>
    <p>
      Favorites are saved in this browser only. There are no accounts, and you do not need to sign in to play.
    </p>
  </>
);

// Draft — pending review
const Privacy = () => (
  <>
    <h1 className="mb-3">Privacy policy</h1>
    <p>
      {SITE_NAME} does not ask you to create an account. Game favorites and tool favorites are stored
      in this browser with localStorage, under the keys playhub_favorites and playhub_tool_favorites.
      That data stays on your device. We do not run a server that collects it.
    </p>
    <p>
      When you open a game, the embed loads from GamePix. GamePix may use its own cookies or storage
      inside that frame. Their policy applies to that embed.
    </p>
    <p>
      The tools in the tools list run in your browser. Do not put secrets into them if you are on a shared computer.
    </p>
  </>
);

// Draft — pending review
const Terms = () => (
  <>
    <h1 className="mb-3">Terms of use</h1>
    <p>
      {SITE_NAME} is free to use. Games are provided by their creators through GamePix embeds.
      We can add, remove, or change games and tools without notice.
    </p>
    <p>
      Do not use the site to break the law or to attack someone else's computer. The site is offered as it is,
      without a promise that every game or tool will always work.
    </p>
  </>
);

const Contact = () => {
  const published = contactEmailPublished();
  return (
    <>
      <h1 className="mb-3">Contact</h1>
      {published ? (
        <p>
          Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      ) : (
        <p>The contact address is not published yet.</p>
      )}
    </>
  );
};

export default InfoPage;

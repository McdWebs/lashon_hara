/**
 * What a visitor sees when the page crashes. It sits outside the router and the site's theme, so it stands on its own:
 * plain links (a full page load, which also clears whatever broke) and its own styles.
 */
const COPY = {
  he: { title: "משהו השתבש", text: "הדף לא נטען כמו שצריך. זה לא אתם, זה אנחנו. אפשר לרענן ולנסות שוב.", retry: "לרענן את הדף", home: "לעמוד הבית", shop: "לחנות" },
  en: { title: "Something went wrong", text: "The page didn't load properly. It's not you, it's us. You can refresh and try again.", retry: "Refresh the page", home: "Back to the home page", shop: "To the shop" },
} as const;

const CSS = `
.crash { min-height: 100vh; min-height: 100svh; display: flex; flex-direction: column; background: #FFFFFF; color: #0D0D0D; font-family: Heebo, Arial, sans-serif; }
.crash-bar { background: #0B0B0B; padding: 0 20px; height: 64px; display: flex; align-items: center; }
.crash-bar img { display: block; height: 26px; width: auto; }
.crash-in { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 56px 24px 96px; gap: 18px; }
.crash-in .crash-code { max-width: none; font-family: Karantina, Heebo, sans-serif; font-weight: 700; font-size: clamp(140px, 38vw, 240px); line-height: .8; color: #E21F26; margin: 0; }
.crash-in h1 { margin: 0; font-family: Karantina, Heebo, sans-serif; font-weight: 700; font-size: clamp(56px, 12vw, 96px); line-height: .9; }
.crash-in p { margin: 0; max-width: 460px; font-size: 18px; line-height: 1.6; color: #4A4A4A; }
.crash-b { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 14px; }
.crash-b button, .crash-b a { display: inline-flex; align-items: center; justify-content: center; height: 52px; padding: 0 30px; border: 2px solid #0D0D0D; border-radius: 0; font: inherit; font-size: 16px; font-weight: 800; text-decoration: none; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
.crash-b button { background: #0D0D0D; color: #FFFFFF; }
.crash-b a { background: #FFFFFF; color: #0D0D0D; }
.crash-b button:hover, .crash-b a:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 #E21F26; }
@media (max-width: 560px) { .crash-b { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; } }
.crash-b :focus-visible { outline: 3px solid #E21F26; outline-offset: 3px; }
`;

export function CrashPage() {
  const en = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
  const c = en ? COPY.en : COPY.he;
  return (
    <div className="crash" role="alert" dir={en ? "ltr" : "rtl"} lang={en ? "en" : "he"}>
      <style>{CSS}</style>
      <header className="crash-bar">
        <a href={en ? "/en" : "/"} aria-label="Lashon Hara">
          <img src={en ? "/images/site/logo-en.svg" : "/images/site/logo.svg"} alt="" />
        </a>
      </header>
      <main className="crash-in">
        <p className="crash-code" aria-hidden="true">!</p>
        <h1>{c.title}</h1>
        <p>{c.text}</p>
        <div className="crash-b">
          <button type="button" onClick={() => window.location.reload()}>{c.retry}</button>
          <a href={en ? "/en" : "/"}>{c.home}</a>
          <a href={en ? "/en/shop" : "/shop"}>{c.shop}</a>
        </div>
      </main>
    </div>
  );
}

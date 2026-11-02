import { useEffect, useRef, useState } from "react";
import { t, Link, siteLang } from "../i18n";
import { HelplinesList } from "../../content/helplinesHe";
import type { FounderBlock } from "../about";
import { copy } from "../copy";
import { Icon, usePageTitle } from "../ui";

const SECTIONS = [
  { id: "who", label: "מי אני" },
  { id: "story", label: "הסיפור שלנו" },
  { id: "what", label: "מה זה לשון הרע" },
  { id: "ambassadors", label: "השגרירים שלנו" },
] as const;

const TIMELINE = [
  { y: "2007", t: "המיזם הוקם על ידי דוד הלפרין. שלטי חוצות, מיליוני סטיקרים וצמידים, בתי חולים ובסיסים צבאיים." },
  { y: "2020", t: "המיזם זכה בפרס ירושלים." },
  { y: "2021", t: "לאחר 14 שנים של פעילות ״גרילה״ הוחלט למסד את הפעילות במסגרת עמותה." },
  { y: "היום", t: "הסלוגן תורגם ל־19 שפות." },
];

const HALACHOT_PER_VIEW = 6;

function shuffled<T>(items: T[]) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const AMBASSADORS = [
  { photo: "/images/site/omer.jpg", name: "עומר אדם", quote: "שים לב מה אתה אומר" },
  { photo: "/images/site/static.jpg", name: "סטטיק", quote: "נוצר לשונו שומר נפשו" },
  { name: "[שם]", quote: "[ציטוט קצר]" },
  { name: "[שם]", quote: "[ציטוט קצר]" },
];

/** The team's own phrases to catch the eye. Marking never changes the words. */
const MARKS = [
  "להקיש על הכוס בשולחן השבת", "התחייבות אישית ולקיחת אחריות", "החיים והמוות ביד הלשון", "מכח ההרגל וחוסר ידע",
  "מילים יכולות להרוג. פשוטו כמשמעו.", "הכל מתחיל מדוגמה אישית", "לא בוחר על מי לדבר, הוא בוחר עם מי לדבר",
  "אפילו מילה אחת פחות לשון הרע", "שליחות וייעוד אישי לחיים", "שלטי חוצות ענקיים", "מיליוני סטיקרים וצמידים",
  "למטבע לשון שגור", "שינוי תרבותי מתחיל בכל אחד מאיתנו", "מפה לאוזן", "חינוך ודוגמא אישית", "19 שפות", "בפרס ירושלים",
  "השמצות, לעג, רכילות (גם סיפור שקרה באמת), הכללה, ביוש (שיימינג), הסתה והלבנת פנים", "לא תלך רכיל בעמך",
  "דברים רעים וטובים כאחד", "ערך מוסף משמעותי", "אין לו שליטה", "אהבת חינם",
];
const MARK_RE = new RegExp(`(${MARKS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);

const MARKS_EN = [
  "tap on his glass", "personal commitment and taking responsibility", "Death and life are in the power of the tongue", "out of habit and lack of knowledge",
  "words can kill. Literally.", "everything starts with a personal example", "does not choose who to talk about, only who to talk to",
  "even one word less of lashon hara", "a mission and a personal calling for life", "giant billboards", "millions of stickers and bracelets",
  "a common expression", "cultural change begins with each of us", "word of mouth", "education and personal example", "19 languages", "the prestigious Jerusalem Prize",
  "slander, mockery, gossip (even a story that really happened), generalizing, shaming, incitement and public humiliation", "You shall not go about as a talebearer among your people",
  "whether the things said are bad or good", "no significant added value", "they have no control", "unconditional love",
];

function markPattern(list: string[]) {
  return new RegExp(`(${list.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
}
const MARK_RE_EN = markPattern(MARKS_EN);

function MARK_RE_NOW() {
  return siteLang() === "en" ? MARK_RE_EN : MARK_RE;
}

function Marked({ text }: { text: string }) {
  return <>{text.split(MARK_RE_NOW()).map((part, i) => (i % 2 ? <mark className="hl" key={i}>{part}</mark> : part))}</>;
}

function Founder({ block }: { block: FounderBlock }) {
  if (typeof block === "string") return <p><Marked text={block} /></p>;
  if (block.kind === "headed") {
    return (
      <div className="headed">
        <h3 className="disp">{block.head}</h3>
        <p><Marked text={block.text} /></p>
      </div>
    );
  }
  if (block.kind === "choice") {
    return (
      <div className="cho rv">
        <p>{block.intro}</p>
        <ul className="cho-l disp">
          <li className="cho-a">
            <span>{block.chosen[0]}</span>
            <span><b>{block.chosen[1]}</b>{block.chosen[2]}<Icon.ok /></span>
          </li>
          <li className="cho-or">{block.or}</li>
          <li className="cho-b">
            <del>
              <span>{block.rejected[0]}</span>
              <span><b>{block.rejected[1]}</b>{block.rejected[2]}</span>
            </del>
          </li>
        </ul>
        <p><Marked text={block.outro} /></p>
      </div>
    );
  }
  if (block.kind === "questions") {
    return (
      <div className="qs">
        <p>{block.intro}</p>
        <ul>{block.items.map((q, i) => <li className="bub rv" key={q} style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>{q}</li>)}</ul>
        <p>{block.outro}</p>
      </div>
    );
  }
  return (
    <div className="post">
      <p>{block.intro}</p>
      <blockquote className="poster disp rv">
        {block.line.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
      </blockquote>
      <p><Marked text={block.outro} /></p>
    </div>
  );
}

/** The line fills with the scroll and each year lights up as the line reaches it. */
function Timeline() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const tl = list.current;
    if (!tl || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(tl.children) as HTMLElement[];
    let frame = 0;

    function update() {
      frame = 0;
      const box = tl!.getBoundingClientRect();
      const style = getComputedStyle(tl!);
      if (style.display === "none") return;
      // Beside the text it stays pinned, so it runs along the text. Under the text it runs as it passes.
      let progress: number;
      if (style.position === "sticky") {
        const track = tl!.parentElement!.getBoundingClientRect();
        progress = (parseFloat(style.top) - track.top) / Math.max(track.height - box.height, 1);
      } else {
        const anchor = window.innerHeight * 0.65;
        progress = (anchor - box.top) / box.height;
      }
      progress = Math.min(Math.max(progress, 0), 1);
      tl!.style.setProperty("--p", String(progress));
      const reached = items.filter((item) => item.offsetTop <= progress * tl!.offsetHeight);
      items.forEach((item) => {
        item.classList.toggle("on", reached.includes(item));
        item.classList.toggle("cur", item === reached[reached.length - 1]);
      });
    }
    function request() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    tl.classList.add("live");
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <ol className="tl" ref={list}>
      {TIMELINE.map((item) => (
        <li className="tl-i" key={item.y}>
          <span className="tl-y disp">{t(item.y)}</span>
          <span className="tl-t">{t(item.t)}</span>
        </li>
      ))}
    </ol>
  );
}

/** Six at a time. Every press shows six new ones, and all of them come up before any repeats. */
function Halachot() {
  const { HALACHOT } = copy();
  const [shown, setShown] = useState(() => HALACHOT.slice(0, HALACHOT_PER_VIEW));
  const [unseen, setUnseen] = useState(() => shuffled(HALACHOT.slice(HALACHOT_PER_VIEW)));
  const [round, setRound] = useState(0);
  const grid = useRef<HTMLDivElement>(null);

  function refresh() {
    const queue = unseen.length >= HALACHOT_PER_VIEW
      ? unseen
      : [...unseen, ...shuffled(HALACHOT.filter((h) => !shown.includes(h) && !unseen.includes(h)))];
    setShown(queue.slice(0, HALACHOT_PER_VIEW));
    setUnseen(queue.slice(HALACHOT_PER_VIEW));
    setRound((r) => r + 1);
    grid.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="rules" ref={grid} aria-live="polite">
        {shown.map((h, i) => (
          <article className="rule" key={`${round}-${h.title}`} style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}>
            <span className="rule-n disp">{i + 1}</span>
            <h3 className="rule-h">{h.title}</h3>
            <p className="rule-t">{h.text}</p>
            <span className="rule-s">{h.source}</span>
          </article>
        ))}
      </div>
      <div className="rules-more">
        <button className="btn btn-line" onClick={refresh} style={{ "--turn": `${round * 360}deg` } as React.CSSProperties}>
          <span>{t("הלכות נוספות")}</span>
          <Icon.refresh />
        </button>
      </div>
    </>
  );
}

function HelplinesEn() {
  return (
    <ul className="help-en">
      <li>ERAN, emotional first aid: phone <a href="tel:1201">1201</a></li>
      <li>SAHAR, online support and listening: <a href="mailto:sahar.help@gmail.com">sahar.help@gmail.com</a></li>
      <li><a href="tel:105">Hotline 105</a>: the National Headquarters for Child Online Protection</li>
      <li>The Israel Internet Association's Safe Internet Center: WhatsApp <a href="https://wa.me/97254858911" target="_blank" rel="noreferrer">054-8-858911</a>, <a href="mailto:safe@isoc.org.il">safe@isoc.org.il</a>, or by <a href="https://safe.org.il" target="_blank" rel="noreferrer">report form</a></li>
    </ul>
  );
}

function Section({ id, n, title, grey, focus, children }: { id: string; n: number; title: string; grey?: boolean; focus: boolean; children: React.ReactNode }) {
  return (
    <section className={`wsec${grey ? " grey" : ""}${focus ? " focus" : ""}`} id={id} data-wsec={id}>
      <div className="wrap">
        <div className="wsec-head">
          <span className="wsec-n disp">0{n}</span>
          <h2 className="wsec-h">{title}</h2>
        </div>
        <div className="wbody">{children}</div>
      </div>
    </section>
  );
}

export function AboutPage() {
  usePageTitle(t("אודות"));
  const [current, setCurrent] = useState<string>("who");
  const lockUntil = useRef(0);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function read() {
      if (Date.now() < lockUntil.current) return;
      const mid = window.innerHeight * 0.45;
      let best: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < mid) best = s.id;
      }
      setCurrent(best);
    }
    window.addEventListener("scroll", read, { passive: true });
    read();
    return () => window.removeEventListener("scroll", read);
  }, []);

  useEffect(() => {
    // Moves the tab strip only: scrollIntoView would also stop the page's own smooth scroll in Safari.
    const strip = bar.current;
    const tab = strip?.querySelector<HTMLElement>(`[data-stab="${current}"]`);
    if (!strip || !tab) return;
    const a = tab.getBoundingClientRect();
    const b = strip.getBoundingClientRect();
    strip.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: "smooth" });
  }, [current]);

  function jump(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setCurrent(id);
    lockUntil.current = Date.now() + 1500;
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="page-about">
      <h1 className="sr">{t("אודות")}</h1>

      <nav className="snav" aria-label={t("חלקי העמוד")}>
        <div className="wrap snav-in" ref={bar}>
          {SECTIONS.map((s, i) => (
            <a key={s.id} className={`stab${current === s.id ? " on" : ""}`} href={`#${s.id}`} data-stab={s.id} aria-current={current === s.id || undefined} onClick={(e) => jump(e, s.id)}>
              <span className="stab-n">0{i + 1}</span>
              {t(s.label)}
            </a>
          ))}
        </div>
      </nav>

      <Section id="who" n={1} title={t("מי אני")} focus={current === "who"}>
        <div className="two">
          <div className="w-ph"><img src="/images/site/founder.jpg" alt={t("דוד הלפרין, מייסד המיזם")} /></div>
          <div className="w-tx">
            <p className="big"><Marked text={copy().FOUNDER_LEAD} /></p>
            {copy().FOUNDER.map((block, i) => <Founder key={i} block={block} />)}
            <p className="sign">{t("דוד הלפרין, מייסד")}</p>
          </div>
        </div>
      </Section>

      <Section id="story" n={2} title={t("הסיפור שלנו")} grey focus={current === "story"}>
        <div className="two">
          <div className="w-tx">
            <p className="big">{copy().MISSION[0]}</p>
            {copy().MISSION.slice(1).map((text) => <p key={text}><Marked text={text} /></p>)}
            <p className="say disp rv">{copy().MISSION_CALL}</p>
            <Link className="btn btn-red say-btn rv" to="/join"><span>{t("הצטרפו")}</span><Icon.arrow /></Link>
          </div>
          <Timeline />
        </div>
      </Section>

      <Section id="what" n={3} title={t("מה זה לשון הרע")} focus={current === "what"}>
        <div className="two">
          <div className="w-tx">
            <p className="def disp">{copy().DEFINITION}</p>
            <div className="test rv">
              <p>{copy().WHAT_TEST.intro}</p>
              <span className="test-l disp">
                <span>{copy().WHAT_TEST.lines[0]}</span>
                <span>{copy().WHAT_TEST.lines[1]}</span>
              </span>
            </div>
            <p><Marked text={copy().WHAT_TEST.after} /></p>
            {copy().WHAT_IS.map((text) => <p key={text}><Marked text={text} /></p>)}
          </div>
          <div className="todo">
            <span className="bar" aria-hidden="true" />
            <h3>{t("מה עושים כשנתקלים בלשון הרע?")}</h3>
            <p>{copy().ACTIONS_INTRO}</p>
            <ul className="acts">
              {copy().ACTIONS.map((a) => (
                <li key={a.head}>
                  <b>{a.head}</b>
                  {a.reply ? <span className="act-say">{a.say} <q className="bub">{a.reply}</q></span> : null}
                  <span>{a.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Halachot />
        <div className="help">
          <h3>{t("מוקדי עזרה")}</h3>
          {siteLang() === "en" ? <HelplinesEn /> : <HelplinesList variant="about" />}
          <p>{t("ללשון הרע יכולות להיות השלכות משפטיות — חוק לשון הרע קובע פיצוי של עד 50,000 ש״ח לנפגעים, ועד שנה מאסר לפוגעים.")}</p>
        </div>
      </Section>

      <Section id="ambassadors" n={4} title={t("השגרירים שלנו")} grey focus={current === "ambassadors"}>
        <p className="lead" style={{ marginBottom: 30 }}>
          {t("בוגרי התכניות שלנו, לצד מתנדבים רבים נוספים, הופכים להיות חלק מקהילה של ״שגרירים״ שמחויבת לשמירת הלשון, סובלנות וכבוד לאחר.")}
        </p>
        <div className="ambs">
          {AMBASSADORS.map((a, i) => (
            <figure className="amb" key={i}>
              <div className="amb-m">
                {a.photo ? <img src={a.photo} alt={t(a.name)} /> : <span className="ph" style={{ position: "absolute", inset: 0 }}>{t("תמונת שגריר/ה")}</span>}
              </div>
              <figcaption>
                <span className="amb-q disp">{siteLang() === "en" ? `“${t(a.quote)}”` : `״${a.quote}״`}</span>
                <span className="amb-n">{t(a.name)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </div>
  );
}

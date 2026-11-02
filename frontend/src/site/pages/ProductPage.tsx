import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { t, Link, siteLang } from "../i18n";
import { track } from "../../lib/analytics";
import { useCart } from "../../lib/cart";
import { fetchProduct, fetchRelatedProducts, type WcProduct } from "../../lib/catalog";
import { SITE_ORIGIN } from "../../lib/seo";
import { clampOrderQuantity, formatOrderRulesNotice, getProductOrderRules, hasOrderConstraints } from "../../lib/productOrderRules";
import { SCHOOLS_PRODUCT_ID } from "../../lib/site";
import { ProductPage as SchoolsProductPage } from "../../pages/ProductPage";
import { CardsSkeleton, Icon, ProductLinkCard, Title, priceLabel, usePageTitle } from "../ui";

function Accordion({ title, open: startOpen, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(Boolean(startOpen));
  return (
    <div className={`acc${open ? " open" : ""}`}>
      <button className="acc-h" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <span className="acc-i" aria-hidden="true" />
      </button>
      <div className="acc-b"><div>{children}</div></div>
    </div>
  );
}

/** Options come from the product itself; a choice with no matching variation can't be picked. */
function useVariation(product: WcProduct) {
  const attributes = useMemo(() => (product.attributes ?? []).filter((a) => a.has_variations !== false), [product]);
  const variations = useMemo(() => product.variations ?? [], [product]);
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const attr of attributes) if (attr.terms.length === 1) initial[attr.name] = attr.terms[0].slug;
    setSelected(initial);
  }, [attributes]);

  const matches = (variation: WcProduct["variations"] extends Array<infer V> | undefined ? V : never, name: string, slug: string) => {
    const value = variation.attributes.find((a) => a.name === name)?.value;
    return value === slug || value === "" || value === undefined;
  };

  const isAvailable = (name: string, slug: string) => variations.length === 0 || variations.some((v) => matches(v, name, slug));

  const variationId = useMemo(() => {
    if (attributes.some((attr) => !selected[attr.name])) return null;
    return variations.find((v) => attributes.every((attr) => matches(v, attr.name, selected[attr.name])))?.id ?? null;
  }, [attributes, variations, selected]);

  return { attributes, selected, setSelected, isAvailable, variationId };
}

function ProductDetail({ product }: { product: WcProduct }) {
  const addItem = useCart((s) => s.addItem);
  const rules = getProductOrderRules(product);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(rules.min);
  const [missing, setMissing] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const { attributes, selected, setSelected, isAvailable, variationId } = useVariation(product);
  const isVariable = product.type === "variable";
  const soldOut = product.is_in_stock === false;
  const categoryId = product.categories[0]?.id;

  const related = useQuery({
    queryKey: ["site-related", product.id, categoryId],
    queryFn: () => fetchRelatedProducts(categoryId!, product.id, 4),
    enabled: Boolean(categoryId),
  });

  useEffect(() => {
    track("product_viewed", { id: product.id, name: product.name });
  }, [product.id, product.name]);

  async function add() {
    const targetId = isVariable ? variationId : product.id;
    if (!targetId) {
      setMissing(true);
      return;
    }
    if (state !== "idle") return;
    setError(null);
    setState("busy");
    const qty = clampOrderQuantity(quantity, rules);
    setQuantity(qty);
    try {
      await addItem(targetId, qty);
      track("product_added_to_cart", { id: targetId, quantity: qty });
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("לא הצלחנו להוסיף לסל. נסו שוב."));
      setState("idle");
    }
  }

  const description = product.description || product.short_description || "";

  return (
    <>
      <div className="wrap crumbs">
        <Link to="/shop">{t("הקולקציה")}</Link>
      </div>

      <section className="wrap prod">
        <div className="gal">
          <div className="gmain">
            {product.images.length === 0 ? <span className="ph" style={{ position: "absolute", inset: 0 }}>{t("תמונה בקרוב")}</span> : null}
            {product.images.map((image, i) => (
              <img key={image.src} className={`gm${i === imageIndex ? " on" : ""}`} src={image.src} alt={image.alt || product.name} />
            ))}
          </div>
          {product.images.length > 1 ? (
            <div className="gts">
              {product.images.map((image, i) => (
                <button key={image.src} className={`gt${i === imageIndex ? " on" : ""}`} aria-label={t("תמונה {n}", { n: i + 1 })} onClick={() => setImageIndex(i)}>
                  <img src={image.thumbnail || image.src} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="info">
          <span className="bar" aria-hidden="true" />
          <h1 className="info-h" dir="auto">{product.name}</h1>
          <span className="info-p">{priceLabel(product)}</span>

          {attributes.map((attr) => (
            <div className="opt" key={attr.id}>
              <span className="flabel" dir="auto">{attr.name}</span>
              <div className={`seg${missing && !selected[attr.name] ? " bad" : ""}`} role="radiogroup" aria-label={attr.name}>
                {attr.terms.map((term) => {
                  const available = isAvailable(attr.name, term.slug);
                  const on = selected[attr.name] === term.slug;
                  return (
                    <button
                      key={term.id}
                      type="button"
                      role="radio"
                      className={`sg${on ? " on" : ""}`}
                      aria-checked={on}
                      aria-disabled={!available || undefined}
                      onClick={() => {
                        if (!available) return;
                        setMissing(false);
                        setSelected((prev) => ({ ...prev, [attr.name]: term.slug }));
                      }}
                    >
                      {term.name}
                    </button>
                  );
                })}
              </div>
              {missing && !selected[attr.name] ? <span className="err on" role="alert">{t("יש לבחור {name}", { name: attr.name })}</span> : null}
            </div>
          ))}

          {hasOrderConstraints(rules) ? <p className="ship" style={{ fontWeight: 700, color: "var(--ink)" }}>{formatOrderRulesNotice(rules, siteLang())}</p> : null}

          <div className="buy-row">
            <div className="qty">
              <button aria-label={t("הפחתת כמות")} onClick={() => setQuantity((q) => clampOrderQuantity(q - rules.step, rules))}><Icon.minus /></button>
              <span aria-live="polite">{quantity}</span>
              <button aria-label={t("הוספת כמות")} onClick={() => setQuantity((q) => clampOrderQuantity(q + rules.step, rules))}><Icon.plus /></button>
            </div>
            <button className={`btn btn-red addbtn${state === "done" ? " done" : ""}`} disabled={soldOut} aria-busy={state === "busy"} onClick={add}>
              <span className="al">
                <span className="a1">{soldOut ? t("אזל מהמלאי") : state === "busy" ? t("מוסיפים…") : t("הוספה לסל")}</span>
                <span className="a2">{t("נוסף לסל ✓")}</span>
              </span>
            </button>
          </div>
          {error ? <p className="ferr on" role="alert">{error}</p> : null}
          <p className="ship">{t("משלוח לכל הארץ · שירות אישי ב־WhatsApp")}</p>

          <div className="accs">
            {description ? <Accordion title={t("פרטי המוצר")} open><div className="acc-html" dir="auto" dangerouslySetInnerHTML={{ __html: description }} /></Accordion> : null}
            <Accordion title={t("משלוחים ושירות")}><p>{t("אנחנו שולחים לכל הארץ. לזמני אספקה, הזמנות בכמות או כל שאלה אחרת — הצוות שלנו זמין ב-WhatsApp.")}</p></Accordion>
            <Accordion title={t("למה זה חשוב")}><p>{t("כל פריט מכניס לחיי היום־יום בחירה פשוטה: לדבר אחרת.")}</p></Accordion>
          </div>
        </div>
      </section>

      {related.isLoading || (related.data?.items.length ?? 0) > 0 ? (
        <section className="wrap rel">
          <Title as="h2">{t("מאותה קולקציה")}</Title>
          <div className="grid">
            {related.isLoading ? <CardsSkeleton count={4} /> : null}
            {related.data?.items.map((p) => <ProductLinkCard key={p.id} product={p} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}

function plainText(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Description, preview image and structured data so a product can show price and stock in search results. */
function productSeo(product: WcProduct) {
  const text = plainText(product.short_description) || plainText(product.description);
  const description = text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  const image = product.images[0]?.src;
  const price = Number(product.prices.price) / 10 ** (product.prices.currency_minor_unit ?? 2);
  return {
    description: description || undefined,
    image,
    type: "product" as const,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: description || undefined,
      image: product.images.map((i) => i.src),
      offers: {
        "@type": "Offer",
        url: `${SITE_ORIGIN}/shop/product/${product.id}`,
        priceCurrency: product.prices.currency_code || "ILS",
        price: Number.isFinite(price) ? price : undefined,
        availability: product.is_in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      },
    },
  };
}

export function ProductPage() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ["product", id], queryFn: () => fetchProduct(id ?? ""), enabled: Boolean(id) });
  const product = query.data;
  usePageTitle(product?.name ?? t("מוצר"), product ? productSeo(product) : {});

  if (query.data?.id === SCHOOLS_PRODUCT_ID) return <SchoolsProductPage />;

  return (
    <div className="page-product">
      {query.isLoading ? (
        <section className="wrap prod" aria-hidden="true" style={{ paddingTop: 48 }}>
          <div className="skel" style={{ aspectRatio: "4 / 5" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skel" style={{ height: 44, width: "80%" }} />
            <div className="skel" style={{ height: 60, width: "30%" }} />
            <div className="skel" style={{ height: 56 }} />
          </div>
        </section>
      ) : null}
      {query.isError ? (
        <div className="wrap state" role="alert">
          <h2>{t("המוצר לא נמצא.")}</h2>
          <Link className="btn btn-line" to="/shop"><span>{t("לכל הקולקציה")}</span><Icon.arrow /></Link>
        </div>
      ) : null}
      {query.data ? <ProductDetail key={query.data.id} product={query.data} /> : null}
    </div>
  );
}

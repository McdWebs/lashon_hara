import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { CommerceSteps } from "../components/CommerceSteps";
import { QuantityStepper } from "../components/QuantityStepper";
import { ShippingStrip } from "../components/ShippingStrip";
import { PageHeader, Section } from "../components/Section";
import { track } from "../lib/analytics";
import { cartTotalMinor, cartWhatsAppText, useCart } from "../lib/cart";
import { submitForm } from "../lib/forms";
import { useLocale } from "../i18n/useLocale";
import { SHOP_COPY } from "../lib/shop";
import { formatIls, SITE, waLink } from "../lib/site";

function OrderSummary({
  totalMinor,
  unit,
  children,
}: {
  totalMinor: number;
  unit: number;
  children?: React.ReactNode;
}) {
  const { lang } = useLocale();

  return (
    <Card variant="outlined" sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
      <CardContent>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {lang === "en" ? "Order summary" : "סיכום הזמנה"}
        </Typography>
        <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
          {lang === "en" ? "Total" : "סה״כ"}: {formatIls(totalMinor, unit)}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2, fontSize: "0.95rem", lineHeight: 1.6 }}>
          {SHOP_COPY.mission[lang]}
        </Typography>
        <ShippingStrip />
        {children && <Box sx={{ mt: 3 }}>{children}</Box>}
      </CardContent>
    </Card>
  );
}

export function CartPage() {
  const { loc, lang } = useLocale();
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const setQuantity = useCart((s) => s.setQuantity);
  const totalMinor = cartTotalMinor(items);
  const unit = items[0]?.currencyMinorUnit ?? 2;

  return (
    <>
      <CommerceSteps current="cart" />
      <PageHeader title={lang === "en" ? "Cart" : "סל קניות"} />
      <Section wide>
        {items.length === 0 ? (
          <>
            <Typography sx={{ mb: 2 }}>{lang === "en" ? "Your cart is empty." : "הסל ריק."}</Typography>
            <Button component={RouterLink} to={loc("/shop")} variant="contained">
              {lang === "en" ? "Go to shop" : "לחנות"}
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Stack spacing={0}>
              {items.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 2.5,
                  }}
                >
                  {item.image && (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 96, height: 96, objectFit: "cover", borderRadius: 1, flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatIls(item.price, item.currencyMinorUnit)}
                    </Typography>
                  </Box>
                  <QuantityStepper
                    size="small"
                    value={item.quantity}
                    onChange={(n) => setQuantity(item.id, n)}
                  />
                  <Button size="small" onClick={() => removeItem(item.id)} sx={{ flexShrink: 0 }}>
                    {lang === "en" ? "Remove" : "הסר"}
                  </Button>
                </Stack>
              ))}
            </Stack>

            <OrderSummary totalMinor={totalMinor} unit={unit}>
              <Stack spacing={1.5}>
                <Button component={RouterLink} to={loc("/checkout")} variant="contained" fullWidth>
                  {lang === "en" ? "Continue to checkout" : "להמשך לקופה"}
                </Button>
                <Button component={RouterLink} to={loc("/shop")} variant="outlined" fullWidth>
                  {lang === "en" ? "Keep shopping" : "המשך קנייה"}
                </Button>
              </Stack>
            </OrderSummary>
          </Box>
        )}
      </Section>
    </>
  );
}

export function CheckoutPage() {
  const { loc, lang } = useLocale();
  const items = useCart((s) => s.items);
  const totalMinor = cartTotalMinor(items);
  const unit = items[0]?.currencyMinorUnit ?? 2;

  return (
    <>
      <CommerceSteps current="checkout" />
      <PageHeader title={lang === "en" ? "Checkout" : "קופה"} />
      <Section wide>
        {items.length === 0 ? (
          <>
            <Typography sx={{ mb: 2 }}>{lang === "en" ? "No items to checkout." : "אין פריטים בקופה."}</Typography>
            <Button component={RouterLink} to={loc("/shop")} variant="contained">
              {lang === "en" ? "Go to shop" : "לחנות"}
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Box>
              <Typography sx={{ mb: 2, maxWidth: 560 }}>
                {lang === "en"
                  ? "Online payment is coming soon. Complete your order on WhatsApp — we'll reply with payment and shipping details."
                  : "סליקה מקוונת בדרך. השלימו את ההזמנה ב-WhatsApp — נחזור אליכם עם פרטי תשלום ומשלוח."}
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", py: 1, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    {item.image && (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 1 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {formatIls(Number(item.price) * item.quantity, item.currencyMinorUnit)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {lang === "en" ? `Support hours: ${SITE.supportHours}` : `שעות מענה: ${SITE.supportHours}`}
              </Typography>
            </Box>

            <OrderSummary totalMinor={totalMinor} unit={unit}>
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  href={waLink(cartWhatsAppText(items))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("checkout_started")}
                >
                  {lang === "en" ? "Complete on WhatsApp" : "השלמת הזמנה ב-WhatsApp"}
                </Button>
                <Button component={RouterLink} to={loc("/cart")} variant="outlined" fullWidth>
                  {lang === "en" ? "Back to cart" : "חזרה לסל"}
                </Button>
              </Stack>
            </OrderSummary>
          </Box>
        )}
      </Section>
    </>
  );
}

export function AccountPage() {
  const { loc } = useLocale();

  return (
    <>
      <PageHeader title="החשבון שלי" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          ניהול הזמנות וחשבון אישי ייפתחו כאשר הסליקה המקוונת תהיה פעילה.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          לעדכון על הזמנה קיימת — WhatsApp 054-3644512.
        </Typography>
        <Button component={RouterLink} to={loc("/contact")} variant="contained">
          צור קשר
        </Button>
      </Section>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <PageHeader title="תקנון ופרטיות" />
      <Section>
        <Typography sx={{ mb: 2 }}>
          רכישה באתר כפופה לתנאי המכירה של עמותת &quot;לשון הרע לא מדבר אלי&quot;. המחירים כוללים מע״מ
          ככל שהדבר חל. משלוחים מתבצעים לנקודות איסוף ברחבי הארץ; משלוח חינם בקנייה מעל 100 ש״ח
          (כפי שמפורסם בחנות).
        </Typography>
        <Typography sx={{ mb: 2 }}>
          ביטול עסקה ואחריות על מוצרים — לפי חוק הגנת הצרכן. לשאלות על הזמנה, החזרה או מוצר פגום
          פנו ב-WhatsApp 054-3644512 או בדף צור קשר.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          טפסים באתר (התחייבות, בית ספר, שגרירים, תרומה) משמשים לקשר עם העמותה. לא נמכור את
          הפרטים לצד שלישי. ניתן לבקש מחיקה או עדכון בפנייה ישירה.
        </Typography>
        <Typography color="text.secondary">
          לשאלות משפטיות מפורטות — צרו קשר עם העמותה.
        </Typography>
      </Section>
    </>
  );
}

export function DonateFormSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("donate", "/donate", Object.fromEntries(form.entries()));
    setSaved(result.saved);
    track("donation_started");
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <Alert severity={saved ? "success" : "warning"} sx={{ maxWidth: 520 }}>
        {saved
          ? "הפנייה התקבלה. נחזור אליכם עם פרטי תרומה."
          : "השמירה נכשלה — פנו ב-WhatsApp 054-3644512."}
      </Alert>
    );
  }

  return (
    <Stack component="form" spacing={2} sx={{ maxWidth: 520, alignItems: "flex-start" }} onSubmit={onSubmit}>
      <TextField name="amount" label="סכום מבוקש (אופציונלי)" placeholder="למשל 180" />
      <TextField required name="name" label="שם" />
      <TextField required name="phone" label="טלפון" />
      <TextField required name="email" type="email" label="אימייל" />
      <TextField name="message" label="הערות" multiline minRows={2} />
      <Button type="submit" variant="contained" disabled={status === "loading"}>
        שליחת בקשת תרומה
      </Button>
      <Link href={waLink("שלום, אני מעוניין/ת לתרום לעמותה")} underline="always" sx={{ fontWeight: 600 }}>
        או ב-WhatsApp
      </Link>
    </Stack>
  );
}

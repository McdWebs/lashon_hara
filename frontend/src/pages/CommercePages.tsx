import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { QuantityStepper } from "../components/QuantityStepper";
import { ShippingStrip } from "../components/ShippingStrip";
import { Section, PageHeader } from "../components/Section";
import { track } from "../lib/analytics";
import {
  cartWhatsAppText,
  type CartItem,
  useCart,
} from "../lib/cart";
import { useLocale } from "../i18n/useLocale";
import { formatIls, waLink } from "../lib/site";

function lineTotalMinor(item: CartItem) {
  return Number(item.price) * item.quantity;
}

function cartTotalMinor(items: CartItem[]) {
  return items.reduce((sum, item) => sum + lineTotalMinor(item), 0);
}

function CartLineItem({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (n: number) => void;
}) {
  const { loc, lang } = useLocale();
  const lineTotal = formatIls(lineTotalMinor(item), item.currencyMinorUnit);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: 0 },
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: "flex-start" }}>
        {item.image ? (
          <Box
            component={RouterLink}
            to={loc(`/shop/product/${item.id}`)}
            sx={{ flexShrink: 0 }}
          >
            <Box
              component="img"
              src={item.image}
              alt={item.name}
              sx={{
                width: { xs: 72, sm: 88 },
                height: { xs: 72, sm: 88 },
                objectFit: "cover",
                borderRadius: 1.5,
                display: "block",
                bgcolor: "#eee",
              }}
            />
          </Box>
        ) : null}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component={RouterLink}
            to={loc(`/shop/product/${item.id}`)}
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.95rem", sm: "1rem" },
              lineHeight: 1.35,
              color: "text.primary",
              textDecoration: "none",
              wordBreak: "break-word",
              "&:hover": { color: "primary.main" },
            }}
          >
            {item.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "0.9rem" }}>
            {formatIls(item.price, item.currencyMinorUnit)}
            {item.quantity > 1 && lang === "en"
              ? " each"
              : item.quantity > 1
                ? " ליחידה"
                : ""}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: 1.5,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              display: { xs: "flex", lg: "none" },
            }}
          >
            <QuantityStepper
              size="small"
              value={item.quantity}
              onChange={onQuantityChange}
            />
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.95rem" }}>
                {lineTotal}
              </Typography>
              <IconButton
                onClick={onRemove}
                aria-label={lang === "en" ? "Remove item" : "הסר פריט"}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <QuantityStepper
            size="small"
            value={item.quantity}
            onChange={onQuantityChange}
          />
          <Typography sx={{ fontWeight: 800, minWidth: 96, textAlign: "end" }}>
            {lineTotal}
          </Typography>
          <IconButton
            onClick={onRemove}
            aria-label={lang === "en" ? "Remove item" : "הסר פריט"}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

function OrderSummary({
  items,
  totalMinor,
  unit,
  children,
}: {
  items: CartItem[];
  totalMinor: number;
  unit: number;
  children?: React.ReactNode;
}) {
  const { lang } = useLocale();
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Card
      variant="outlined"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 96 },
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          "&:last-child": { pb: { xs: 2.5, md: 3 } },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2 }}>
          {lang === "en" ? "Order summary" : "סיכום הזמנה"}
        </Typography>

        <Stack spacing={1.25} sx={{ mb: 2 }}>
          {items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              spacing={1}
              sx={{ justifyContent: "space-between", gap: 2 }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.9rem",
                  lineHeight: 1.4,
                  flex: 1,
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                {item.name} × {item.quantity}
              </Typography>
              <Typography
                sx={{ fontSize: "0.9rem", fontWeight: 600, flexShrink: 0 }}
              >
                {formatIls(lineTotalMinor(item), item.currencyMinorUnit)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 1,
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
            {lang === "en"
              ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
              : `${itemCount} פריטים`}
          </Typography>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.35rem", color: "primary.main" }}
          >
            {formatIls(totalMinor, unit)}
          </Typography>
        </Stack>

        {children && <Stack spacing={1.5}>{children}</Stack>}

        <Box sx={{ mt: 2.5 }}>
          <ShippingStrip compact />
        </Box>
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
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      <Section wide>
        <Box sx={{ pb: items.length > 0 ? { xs: 12, lg: 0 } : 0 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-end" },
            mb: 3,
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "1.5rem", md: "1.85rem" },
                lineHeight: 1.2,
              }}
            >
              {lang === "en" ? "Cart" : "סל קניות"}
            </Typography>
            {items.length > 0 && (
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {lang === "en"
                  ? `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`
                  : `${itemCount} פריטים בסל`}
              </Typography>
            )}
          </Box>
          {items.length > 0 && (
            <Button
              component={RouterLink}
              to={loc("/shop")}
              variant="text"
              size="small"
              sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
            >
              {lang === "en" ? "Continue shopping" : "המשך קנייה"}
            </Button>
          )}
        </Stack>

        {items.length === 0 ? (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              textAlign: "center",
              py: { xs: 6, md: 8 },
              px: 3,
            }}
          >
            <ShoppingBagOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
              {lang === "en" ? "Your cart is empty" : "הסל ריק"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 360, mx: "auto", lineHeight: 1.65 }}
            >
              {lang === "en"
                ? "Browse the shop and add products that spread the message."
                : "עברו בחנות והוסיפו מוצרים שמפיצים את המסר."}
            </Typography>
            <Button
              component={RouterLink}
              to={loc("/shop")}
              variant="contained"
            >
              {lang === "en" ? "Go to shop" : "לחנות"}
            </Button>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr minmax(280px, 340px)" },
              gap: { xs: 2.5, sm: 3, lg: 4 },
              alignItems: "start",
            }}
          >
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              {items.map((item) => (
                <CartLineItem
                  key={item.key}
                  item={item}
                  onRemove={() => removeItem(item.key)}
                  onQuantityChange={(n) => setQuantity(item.key, n)}
                />
              ))}
            </Card>

            <OrderSummary items={items} totalMinor={totalMinor} unit={unit}>
              <Button
                component={RouterLink}
                to={loc("/checkout")}
                variant="contained"
                fullWidth
                size="large"
                sx={{ display: { xs: "none", lg: "inline-flex" } }}
              >
                {lang === "en" ? "Continue to checkout" : "להמשך לקופה"}
              </Button>
              <Button
                component={RouterLink}
                to={loc("/shop")}
                variant="outlined"
                fullWidth
              >
                {lang === "en" ? "Keep shopping" : "המשך קנייה"}
              </Button>
            </OrderSummary>
          </Box>
        )}
        </Box>
      </Section>

      {items.length > 0 && (
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            position: "fixed",
            insetInline: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar - 1,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            boxShadow: "0 -4px 24px rgba(17,17,17,0.08)",
            px: 2,
            py: 1.5,
            pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography color="text.secondary" sx={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                {lang === "en"
                  ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
                  : `${itemCount} פריטים`}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "primary.main" }}>
                {formatIls(totalMinor, unit)}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={loc("/checkout")}
              variant="contained"
              size="large"
              sx={{ flexShrink: 0, minWidth: { xs: 132, sm: 160 } }}
            >
              {lang === "en" ? "Checkout" : "לקופה"}
            </Button>
          </Stack>
        </Box>
      )}
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
      <Section wide>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "1.5rem", md: "1.85rem" },
            mb: 3,
            lineHeight: 1.2,
          }}
        >
          {lang === "en" ? "Checkout" : "קופה"}
        </Typography>

        {items.length === 0 ? (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              textAlign: "center",
              py: { xs: 6, md: 8 },
              px: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
              {lang === "en" ? "Nothing to checkout" : "אין פריטים בקופה"}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {lang === "en"
                ? "Add products from the shop first."
                : "הוסיפו מוצרים מהחנות תחילה."}
            </Typography>
            <Button
              component={RouterLink}
              to={loc("/shop")}
              variant="contained"
            >
              {lang === "en" ? "Go to shop" : "לחנות"}
            </Button>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
              gap: { xs: 3, md: 4 },
              alignItems: "start",
            }}
          >
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, p: { xs: 2.5, md: 3 } }}
            >
              <Stack spacing={0} sx={{ mb: 2 }}>
                {items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": { borderBottom: 0 },
                    }}
                  >
                    {item.image && (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {item.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, flexShrink: 0 }}>
                      {formatIls(lineTotalMinor(item), item.currencyMinorUnit)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <OrderSummary items={items} totalMinor={totalMinor} unit={unit}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                href={waLink(cartWhatsAppText(items))}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("checkout_started")}
              >
                {lang === "en"
                  ? "Complete on WhatsApp"
                  : "השלמת הזמנה ב-WhatsApp"}
              </Button>
              <Button
                component={RouterLink}
                to={loc("/cart")}
                variant="outlined"
                fullWidth
              >
                {lang === "en" ? "Back to cart" : "חזרה לסל"}
              </Button>
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

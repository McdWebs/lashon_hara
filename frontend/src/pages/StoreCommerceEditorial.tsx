import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Box, Button, IconButton, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { QuantityStepper } from "../components/QuantityStepper";
import { useLocale } from "../i18n/useLocale";
import { type CartItem, useCart } from "../lib/cart";
import { formatIls } from "../lib/site";
import { STORE_MAX_WIDTH } from "../lib/storeUi";

export function OrderTotal({
  items,
  total,
  unit,
  action,
}: {
  items: CartItem[];
  total: string;
  unit: number;
  action: React.ReactNode;
}) {
  const { lang } = useLocale();
  return (
    <Box sx={{ position: { md: "sticky" }, top: { md: 132 }, borderTop: "1px solid #111", pt: 2.5 }}>
      <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 24, mb: 2.5 }}>
        {lang === "en" ? "Order summary" : "סיכום הזמנה"}
      </Typography>
      <Stack sx={{ gap: 1.2 }}>
        {items.map((item) => (
          <Stack key={item.key} direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
            <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.4 }}>
              {item.name} × {item.quantity}
            </Typography>
            <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
              {formatIls(item.lineTotal, item.currencyMinorUnit)}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "baseline",
          mt: 2.5,
          pt: 2.5,
          borderTop: "1px solid rgba(17,17,17,.14)",
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>{lang === "en" ? "Total" : "סה״כ"}</Typography>
        <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 30 }}>
          {formatIls(total, unit)}
        </Typography>
      </Stack>
      <Stack sx={{ mt: 2.5, gap: 1.2 }}>{action}</Stack>
      <Typography sx={{ mt: 2, fontSize: 11, lineHeight: 1.55, color: "rgba(17,17,17,.52)", textAlign: "center" }}>
        {lang === "en"
          ? "Personal service and delivery throughout Israel."
          : "שירות אישי ומשלוח לכל הארץ."}
      </Typography>
    </Box>
  );
}

export function EmptyCommerce({ checkout = false }: { checkout?: boolean }) {
  const { lang, loc } = useLocale();
  return (
    <Stack sx={{ minHeight: 480, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <ShoppingBagOutlinedIcon sx={{ fontSize: 42, mb: 2, opacity: 0.3 }} />
      <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 32 }}>
        {checkout
          ? lang === "en"
            ? "Nothing to checkout yet."
            : "עדיין אין מה להזמין."
          : lang === "en"
            ? "Your cart is empty."
            : "הסל עדיין ריק."}
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: "text.secondary" }}>
        {lang === "en" ? "Let's find something worth wearing." : "בואו נמצא משהו ששווה ללבוש."}
      </Typography>
      <Button component={RouterLink} to={loc("/shop")} variant="contained" color="secondary">
        {lang === "en" ? "Explore the shop" : "לגלות את החנות"}
      </Button>
    </Stack>
  );
}

export function CartPageEditorial() {
  const { lang, loc } = useLocale();
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const setQuantity = useCart((state) => state.setQuantity);
  const totalPrice = useCart((state) => state.totalPrice);
  const currencyMinorUnit = useCart((state) => state.currencyMinorUnit);

  return (
    <Box sx={{ bgcolor: "#f8f6f1", minHeight: "70vh", py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2.5, md: 3.5 } }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", mb: 1 }}>
          {lang === "en" ? "Your selection" : "הבחירה שלכם"}
        </Typography>
        <Typography component="h1" sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 48, md: 74 }, lineHeight: 1 }}>
          {lang === "en" ? "Shopping cart" : "סל קניות"}
        </Typography>

        {items.length === 0 ? (
          <EmptyCommerce />
        ) : (
          <Box
            sx={{
              mt: { xs: 5, md: 7 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
              gap: { xs: 6, md: 8 },
              alignItems: "start",
            }}
          >
            <Box>
              {items.map((item) => (
                <Stack
                  key={item.key}
                  direction="row"
                  sx={{ py: 2.5, gap: { xs: 1.5, sm: 2.5 }, borderTop: "1px solid rgba(17,17,17,.14)" }}
                >
                  {item.image && (
                    <Link component={RouterLink} to={loc(`/shop/product/${item.id}`)}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: { xs: 90, sm: 125 }, height: { xs: 112, sm: 154 }, objectFit: "cover", display: "block", bgcolor: "#eee9e0" }}
                      />
                    </Link>
                  )}
                  <Stack sx={{ flex: 1, minWidth: 0, justifyContent: "space-between" }}>
                    <Box>
                      <Link component={RouterLink} to={loc(`/shop/product/${item.id}`)} underline="none" sx={{ color: "inherit", fontSize: { xs: 14, sm: 17 }, fontWeight: 600 }}>
                        {item.name}
                      </Link>
                      <Typography sx={{ mt: 0.7, fontSize: 13, color: "text.secondary" }}>
                        {formatIls(item.price, item.currencyMinorUnit)}
                      </Typography>
                    </Box>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <QuantityStepper value={item.quantity} onChange={(quantity) => setQuantity(item.key, quantity)} size="small" />
                      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {formatIls(item.lineTotal, item.currencyMinorUnit)}
                        </Typography>
                        <IconButton size="small" onClick={() => removeItem(item.key)} aria-label={lang === "en" ? "Remove" : "הסרה"}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
            </Box>
            <OrderTotal
              items={items}
              total={totalPrice}
              unit={currencyMinorUnit}
              action={
                <>
                  <Button component={RouterLink} to={loc("/checkout")} variant="contained" color="secondary" size="large" fullWidth>
                    {lang === "en" ? "Continue to checkout" : "להמשך לקופה"}
                  </Button>
                  <Button component={RouterLink} to={loc("/shop")} fullWidth sx={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}>
                    {lang === "en" ? "Continue shopping" : "המשך קנייה"}
                  </Button>
                </>
              }
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

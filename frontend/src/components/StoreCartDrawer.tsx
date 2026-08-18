import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Box, Button, Drawer, IconButton, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { cartTotalMinor, useCart } from "../lib/cart";
import { formatIls } from "../lib/site";
import { STORE_COPY } from "../lib/storeUi";
import { QuantityStepper } from "./QuantityStepper";

export function StoreCartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang, loc } = useLocale();
  const copy = STORE_COPY[lang];
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const setQuantity = useCart((state) => state.setQuantity);
  const total = cartTotalMinor(items);
  const unit = items[0]?.currencyMinorUnit ?? 2;

  return (
    <Drawer
      anchor={lang === "he" ? "left" : "right"}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 460 },
            bgcolor: "#fffdf8",
            backgroundImage: "none",
          },
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Stack
          direction="row"
          sx={{
            minHeight: 72,
            px: 2.5,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(17,17,17,.12)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Secular One", Heebo, sans-serif',
              fontSize: 22,
              fontWeight: 400,
            }}
          >
            {copy.cart}
          </Typography>
          <IconButton onClick={onClose} aria-label={lang === "en" ? "Close cart" : "סגירת הסל"}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {items.length === 0 ? (
          <Stack sx={{ flex: 1, px: 3, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 28, mb: 1.5 }}>
              {lang === "en" ? "Your cart is waiting." : "הסל מחכה לכם."}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              {lang === "en" ? "Find something worth carrying forward." : "מצאו משהו ששווה לקחת הלאה."}
            </Typography>
            <Button component={RouterLink} to={loc("/shop")} onClick={onClose} variant="contained" color="secondary">
              {lang === "en" ? "Explore the shop" : "לגלות את החנות"}
            </Button>
          </Stack>
        ) : (
          <>
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5 }}>
              {items.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={2}
                  sx={{ py: 2.5, borderBottom: "1px solid rgba(17,17,17,.12)", alignItems: "flex-start" }}
                >
                  {item.image && (
                    <Link component={RouterLink} to={loc(`/shop/product/${item.id}`)} onClick={onClose}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: 92, height: 112, objectFit: "cover", display: "block", bgcolor: "#eee9e0" }}
                      />
                    </Link>
                  )}
                  <Stack sx={{ flex: 1, minWidth: 0, minHeight: 112, justifyContent: "space-between" }}>
                    <Box>
                      <Link
                        component={RouterLink}
                        to={loc(`/shop/product/${item.id}`)}
                        onClick={onClose}
                        underline="none"
                        sx={{ color: "inherit", fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}
                      >
                        {item.name}
                      </Link>
                      <Typography sx={{ mt: 0.6, fontSize: 14 }}>
                        {formatIls(item.price, item.currencyMinorUnit)}
                      </Typography>
                    </Box>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <QuantityStepper
                        size="small"
                        value={item.quantity}
                        onChange={(quantity) => setQuantity(item.id, quantity)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.id)}
                        aria-label={lang === "en" ? "Remove item" : "הסרת פריט"}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
            </Box>
            <Box sx={{ p: 2.5, borderTop: "1px solid rgba(17,17,17,.12)" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 2 }}>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  {lang === "en" ? "Subtotal" : "סכום ביניים"}
                </Typography>
                <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 24 }}>
                  {formatIls(total, unit)}
                </Typography>
              </Stack>
              <Button
                fullWidth
                size="large"
                variant="contained"
                color="secondary"
                component={RouterLink}
                to={loc("/checkout")}
                onClick={onClose}
              >
                {lang === "en" ? "Continue to checkout" : "להמשך לקופה"}
              </Button>
              <Button
                fullWidth
                component={RouterLink}
                to={loc("/cart")}
                onClick={onClose}
                sx={{ mt: 1, color: "text.primary", textDecoration: "underline", textUnderlineOffset: 4 }}
              >
                {lang === "en" ? "View full cart" : "לצפייה בסל המלא"}
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Drawer>
  );
}

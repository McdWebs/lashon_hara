import { Alert, Box, Checkbox, FormControlLabel, Radio, RadioGroup, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { CityAutocomplete } from "../components/CityAutocomplete";
import { LoadingButton } from "../components/States";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import { cartApi, checkoutRequest, type WcShippingPackage } from "../lib/cartSession";
import { decodeHtmlEntities } from "../lib/html";
import { formatIls } from "../lib/site";
import { STORE_MAX_WIDTH } from "../lib/storeUi";
import { EmptyCommerce, OrderTotal } from "./StoreCommerceEditorial";

type AddressForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string | null;
  postcode: string;
};

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: null,
  postcode: "",
};

function toWcAddress(form: AddressForm, withEmail: boolean) {
  return {
    first_name: form.firstName,
    last_name: form.lastName,
    address_1: form.address1,
    address_2: form.address2,
    city: form.city ?? "",
    postcode: form.postcode,
    country: "IL",
    phone: form.phone,
    ...(withEmail ? { email: form.email } : {}),
  };
}

function isAddressComplete(form: AddressForm) {
  return Boolean(
    form.firstName && form.lastName && form.phone && form.address1 && form.address2 && form.city && form.postcode,
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const REQUIRED_MESSAGE = { he: "שדה חובה", en: "Required" };
const INVALID_EMAIL_MESSAGE = { he: "יש להזין כתובת מייל תקינה", en: "Enter a valid email" };

const ERROR_MESSAGES: Record<string, { he: string; en: string }> = {
  woocommerce_rest_product_out_of_stock: {
    he: "אחד הפריטים בסל אזל מהמלאי. נא לעדכן את הסל ולנסות שוב.",
    en: "One of the items in your cart is out of stock. Please update your cart and try again.",
  },
  woocommerce_rest_missing_email_address: {
    he: "יש להזין כתובת מייל תקינה.",
    en: "Please enter a valid email address.",
  },
  woocommerce_rest_invalid_address: {
    he: "חסרים פרטים בכתובת — נא לוודא שמולא מספר בניין/דירה.",
    en: "There's a problem with the address — please make sure the building/apartment number is filled in.",
  },
};

function errorMessage(code: string, lang: "he" | "en") {
  return ERROR_MESSAGES[code]?.[lang] ?? (lang === "en" ? "Something went wrong. Please try again." : "משהו השתבש. נסו שוב.");
}

export function CheckoutPageEditorial() {
  const { lang, loc } = useLocale();
  const navigate = useNavigate();
  const items = useCart((state) => state.items);
  const hydrated = useCart((state) => state.hydrated);
  const currencyMinorUnit = useCart((state) => state.currencyMinorUnit);
  const needsShipping = useCart((state) => state.needsShipping);

  const [billing, setBilling] = useState<AddressForm>(emptyAddress);
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [shipping, setShipping] = useState<AddressForm>(emptyAddress);
  const [note, setNote] = useState("");

  const [shippingPackages, setShippingPackages] = useState<WcShippingPackage[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  function updateBilling<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setBilling((prev) => ({ ...prev, [key]: value }));
  }

  function updateShipping<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key: string) {
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }

  function requiredError(key: string, value: string | null): string | undefined {
    if (!touched.has(key) && !attemptedSubmit) return undefined;
    return value ? undefined : REQUIRED_MESSAGE[lang];
  }

  function emailFieldError(key: string, value: string): string | undefined {
    if (!touched.has(key) && !attemptedSubmit) return undefined;
    if (!value) return REQUIRED_MESSAGE[lang];
    if (!isValidEmail(value)) return INVALID_EMAIL_MESSAGE[lang];
    return undefined;
  }

  const activeShipping = shipToDifferent ? shipping : billing;
  const shippingAddressReady = isAddressComplete(activeShipping);

  useEffect(() => {
    if (!needsShipping || !shippingAddressReady) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setCheckingShipping(true);
      try {
        const cart = await cartApi.updateCustomer({
          billing_address: toWcAddress(billing, true),
          shipping_address: toWcAddress(activeShipping, false),
        });
        if (cancelled) return;
        setShippingPackages(cart.shipping_rates);
        const defaultRate = cart.shipping_rates[0]?.shipping_rates.find((r) => r.selected);
        setSelectedRateId(defaultRate?.rate_id ?? cart.shipping_rates[0]?.shipping_rates[0]?.rate_id ?? null);
      } catch {
        /* the "Complete purchase" flow will surface the real error if it still can't proceed */
      } finally {
        if (!cancelled) setCheckingShipping(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    needsShipping,
    shippingAddressReady,
    billing.firstName,
    billing.lastName,
    billing.address1,
    billing.city,
    billing.postcode,
    activeShipping.firstName,
    activeShipping.lastName,
    activeShipping.address1,
    activeShipping.city,
    activeShipping.postcode,
  ]);

  async function handleSubmit() {
    const addressInvalid =
      !isAddressComplete(billing) ||
      !isValidEmail(billing.email) ||
      (shipToDifferent && !isAddressComplete(shipping));
    if (addressInvalid) {
      setAttemptedSubmit(true);
      return;
    }
    if (checkingShipping || (needsShipping && !selectedRateId)) return;
    setSubmitting(true);
    setError(null);
    try {
      if (needsShipping) {
        const cart = await cartApi.updateCustomer({
          billing_address: toWcAddress(billing, true),
          shipping_address: toWcAddress(activeShipping, false),
        });
        const firstPackage = cart.shipping_rates[0];
        const rateId = selectedRateId ?? firstPackage?.shipping_rates.find((r) => r.selected)?.rate_id;
        if (firstPackage && rateId) {
          await cartApi.selectShippingRate({ package_id: firstPackage.package_id, rate_id: rateId });
        }
      }

      track("checkout_started");

      const result = await checkoutRequest({
        billing_address: toWcAddress(billing, true),
        shipping_address: needsShipping ? toWcAddress(activeShipping, false) : undefined,
        customer_note: note || undefined,
      });

      sessionStorage.setItem("lh-last-order", JSON.stringify({ id: result.order_id, key: result.order_key }));

      if (result.payment_result.redirect_url) {
        window.location.href = result.payment_result.redirect_url;
        return;
      }
      navigate(loc(`/order-confirmation?order_id=${result.order_id}&key=${encodeURIComponent(result.order_key)}`));
    } catch (err) {
      const code = err instanceof Error ? err.message : "checkout_failed";
      setError(errorMessage(code, lang));
      setSubmitting(false);
      track("payment_failed", { code });
    }
  }

  if (!hydrated) {
    return (
      <Box sx={{ bgcolor: "#f8f6f1", minHeight: "70vh", py: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2.5, md: 3.5 } }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", mb: 1 }}>
            {lang === "en" ? "Almost there" : "כמעט סיימנו"}
          </Typography>
          <Typography component="h1" sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 48, md: 74 }, lineHeight: 1 }}>
            {lang === "en" ? "Checkout" : "השלמת הזמנה"}
          </Typography>
          <Box
            sx={{
              mt: { xs: 5, md: 7 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 360px" },
              gap: { xs: 6, md: 10 },
              alignItems: "start",
            }}
          >
            <Box sx={{ bgcolor: "#fffdf8", p: { xs: 3, md: 4 } }}>
              <Skeleton width="45%" height={22} animation="wave" />
              <Stack sx={{ gap: 1.75, mt: 2 }}>
                <Stack direction="row" sx={{ gap: 1.5 }}>
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                </Stack>
                <Stack direction="row" sx={{ gap: 1.5 }}>
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                </Stack>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} animation="wave" />
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} animation="wave" />
                <Stack direction="row" sx={{ gap: 1.5 }}>
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                  <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} animation="wave" />
                </Stack>
              </Stack>
            </Box>
            <Box sx={{ borderTop: "1px solid #111", pt: 2.5 }}>
              <Skeleton width="55%" height={28} animation="wave" />
              <Skeleton width="80%" height={16} sx={{ mt: 2 }} animation="wave" />
              <Skeleton width="60%" height={16} sx={{ mt: 1 }} animation="wave" />
              <Stack direction="row" sx={{ justifyContent: "space-between", mt: 2.5, pt: 2.5, borderTop: "1px solid rgba(17,17,17,.14)" }}>
                <Skeleton width={50} height={22} animation="wave" />
                <Skeleton width={80} height={34} animation="wave" />
              </Stack>
              <Skeleton variant="rectangular" height={48} sx={{ mt: 2.5, borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: "#f8f6f1", minHeight: "70vh", py: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2.5, md: 3.5 } }}>
          <EmptyCommerce checkout />
        </Box>
      </Box>
    );
  }


  const selectedRate = shippingPackages[0]?.shipping_rates.find((r) => r.rate_id === selectedRateId);
  const itemsSubtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const displayTotal = String(itemsSubtotal + (needsShipping && selectedRate ? Number(selectedRate.price) : 0));
  const showAddressErrorSummary =
    attemptedSubmit &&
    (!isAddressComplete(billing) || !isValidEmail(billing.email) || (shipToDifferent && !isAddressComplete(shipping)));

  return (
    <Box sx={{ bgcolor: "#f8f6f1", minHeight: "70vh", py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: STORE_MAX_WIDTH, mx: "auto", px: { xs: 2.5, md: 3.5 } }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", mb: 1 }}>
          {lang === "en" ? "Almost there" : "כמעט סיימנו"}
        </Typography>
        <Typography component="h1" sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 48, md: 74 }, lineHeight: 1 }}>
          {lang === "en" ? "Checkout" : "השלמת הזמנה"}
        </Typography>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 360px" },
            gap: { xs: 6, md: 10 },
            alignItems: "start",
          }}
        >
          <Box sx={{ bgcolor: "#fffdf8", p: { xs: 3, md: 4 } }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              {lang === "en" ? "Contact & delivery address" : "פרטי קשר וכתובת למשלוח"}
            </Typography>
            <Stack sx={{ gap: 1.75 }}>
              <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  required
                  size="small"
                  label={lang === "en" ? "First name" : "שם פרטי"}
                  value={billing.firstName}
                  onChange={(e) => updateBilling("firstName", e.target.value)}
                  onBlur={() => markTouched("billing.firstName")}
                  error={Boolean(requiredError("billing.firstName", billing.firstName))}
                  helperText={requiredError("billing.firstName", billing.firstName)}
                  sx={{ flex: 1, minWidth: 140 }}
                />
                <TextField
                  required
                  size="small"
                  label={lang === "en" ? "Last name" : "שם משפחה"}
                  value={billing.lastName}
                  onChange={(e) => updateBilling("lastName", e.target.value)}
                  onBlur={() => markTouched("billing.lastName")}
                  error={Boolean(requiredError("billing.lastName", billing.lastName))}
                  helperText={requiredError("billing.lastName", billing.lastName)}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              </Stack>
              <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  required
                  size="small"
                  type="tel"
                  label={lang === "en" ? "Phone" : "טלפון"}
                  value={billing.phone}
                  onChange={(e) => updateBilling("phone", e.target.value)}
                  onBlur={() => markTouched("billing.phone")}
                  error={Boolean(requiredError("billing.phone", billing.phone))}
                  helperText={requiredError("billing.phone", billing.phone)}
                  sx={{ flex: 1, minWidth: 140 }}
                />
                <TextField
                  required
                  size="small"
                  type="email"
                  label={lang === "en" ? "Email" : "כתובת מייל"}
                  value={billing.email}
                  onChange={(e) => updateBilling("email", e.target.value)}
                  onBlur={() => markTouched("billing.email")}
                  error={Boolean(emailFieldError("billing.email", billing.email))}
                  helperText={emailFieldError("billing.email", billing.email)}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              </Stack>
              <TextField
                required
                size="small"
                label={lang === "en" ? "Address" : "כתובת"}
                value={billing.address1}
                onChange={(e) => updateBilling("address1", e.target.value)}
                onBlur={() => markTouched("billing.address1")}
                error={Boolean(requiredError("billing.address1", billing.address1))}
                helperText={requiredError("billing.address1", billing.address1)}
              />
              <TextField
                required
                size="small"
                label={lang === "en" ? "Building / apartment number" : "מספר בניין / דירה"}
                value={billing.address2}
                onChange={(e) => updateBilling("address2", e.target.value)}
                onBlur={() => markTouched("billing.address2")}
                error={Boolean(requiredError("billing.address2", billing.address2))}
                helperText={requiredError("billing.address2", billing.address2)}
              />
              <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <CityAutocomplete
                    label={lang === "en" ? "City" : "עיר"}
                    required
                    size="small"
                    onBlur={() => markTouched("billing.city")}
                    error={Boolean(requiredError("billing.city", billing.city))}
                    helperText={requiredError("billing.city", billing.city)}
                    value={billing.city}
                    onChange={(value) => updateBilling("city", value)}
                  />
                </Box>
                <TextField
                  required
                  size="small"
                  label={lang === "en" ? "Postcode" : "מיקוד"}
                  value={billing.postcode}
                  onChange={(e) => updateBilling("postcode", e.target.value)}
                  onBlur={() => markTouched("billing.postcode")}
                  error={Boolean(requiredError("billing.postcode", billing.postcode))}
                  helperText={requiredError("billing.postcode", billing.postcode)}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={shipToDifferent}
                    onChange={(e) => setShipToDifferent(e.target.checked)}
                  />
                }
                label={lang === "en" ? "Ship to a different address" : "משלוח לכתובת אחרת"}
              />

              {shipToDifferent && (
                <Stack sx={{ gap: 1.75, pt: 1, borderTop: "1px solid rgba(17,17,17,.1)" }}>
                  <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
                    <TextField
                      required
                      size="small"
                      label={lang === "en" ? "First name" : "שם פרטי"}
                      value={shipping.firstName}
                      onChange={(e) => updateShipping("firstName", e.target.value)}
                      onBlur={() => markTouched("shipping.firstName")}
                      error={Boolean(requiredError("shipping.firstName", shipping.firstName))}
                      helperText={requiredError("shipping.firstName", shipping.firstName)}
                      sx={{ flex: 1, minWidth: 140 }}
                    />
                    <TextField
                      required
                      size="small"
                      label={lang === "en" ? "Last name" : "שם משפחה"}
                      value={shipping.lastName}
                      onChange={(e) => updateShipping("lastName", e.target.value)}
                      onBlur={() => markTouched("shipping.lastName")}
                      error={Boolean(requiredError("shipping.lastName", shipping.lastName))}
                      helperText={requiredError("shipping.lastName", shipping.lastName)}
                      sx={{ flex: 1, minWidth: 140 }}
                    />
                  </Stack>
                  <TextField
                    required
                    size="small"
                    label={lang === "en" ? "Address" : "כתובת"}
                    value={shipping.address1}
                    onChange={(e) => updateShipping("address1", e.target.value)}
                    onBlur={() => markTouched("shipping.address1")}
                    error={Boolean(requiredError("shipping.address1", shipping.address1))}
                    helperText={requiredError("shipping.address1", shipping.address1)}
                  />
                  <TextField
                    required
                    size="small"
                    label={lang === "en" ? "Building / apartment number" : "מספר בניין / דירה"}
                    value={shipping.address2}
                    onChange={(e) => updateShipping("address2", e.target.value)}
                    onBlur={() => markTouched("shipping.address2")}
                    error={Boolean(requiredError("shipping.address2", shipping.address2))}
                    helperText={requiredError("shipping.address2", shipping.address2)}
                  />
                  <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 160 }}>
                      <CityAutocomplete
                        label={lang === "en" ? "City" : "עיר"}
                        required
                        size="small"
                        onBlur={() => markTouched("shipping.city")}
                        error={Boolean(requiredError("shipping.city", shipping.city))}
                        helperText={requiredError("shipping.city", shipping.city)}
                        value={shipping.city}
                        onChange={(value) => updateShipping("city", value)}
                      />
                    </Box>
                    <TextField
                      required
                      size="small"
                      label={lang === "en" ? "Postcode" : "מיקוד"}
                      value={shipping.postcode}
                      onChange={(e) => updateShipping("postcode", e.target.value)}
                      onBlur={() => markTouched("shipping.postcode")}
                      error={Boolean(requiredError("shipping.postcode", shipping.postcode))}
                      helperText={requiredError("shipping.postcode", shipping.postcode)}
                      sx={{ flex: 1, minWidth: 140 }}
                    />
                    <TextField
                      required
                      size="small"
                      type="tel"
                      label={lang === "en" ? "Phone" : "טלפון"}
                      value={shipping.phone}
                      onChange={(e) => updateShipping("phone", e.target.value)}
                      onBlur={() => markTouched("shipping.phone")}
                      error={Boolean(requiredError("shipping.phone", shipping.phone))}
                      helperText={requiredError("shipping.phone", shipping.phone)}
                      sx={{ flex: 1, minWidth: 140 }}
                    />
                  </Stack>
                </Stack>
              )}

              {needsShipping && shippingPackages[0]?.shipping_rates && shippingPackages[0].shipping_rates.length > 0 && (
                <Box sx={{ pt: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    {lang === "en" ? "Delivery method" : "אופן משלוח"}
                  </Typography>
                  <RadioGroup value={selectedRateId ?? ""} onChange={(e) => setSelectedRateId(e.target.value)}>
                    {shippingPackages[0].shipping_rates.map((rate) => (
                      <FormControlLabel
                        key={rate.rate_id}
                        value={rate.rate_id}
                        control={<Radio size="small" />}
                        label={`${decodeHtmlEntities(rate.name)} — ${rate.price === "0" ? (lang === "en" ? "Free" : "חינם") : formatIls(rate.price, rate.currency_minor_unit)}`}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}
              {checkingShipping && (
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {lang === "en" ? "Checking delivery options…" : "בודקים אפשרויות משלוח…"}
                </Typography>
              )}

              <TextField
                size="small"
                multiline
                minRows={2}
                label={lang === "en" ? "Order note (optional)" : "הערה להזמנה (לא חובה)"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Stack>
          </Box>

          <OrderTotal
            items={items}
            total={displayTotal}
            unit={currencyMinorUnit}
            action={
              <>
                {error && <Alert severity="error">{error}</Alert>}
                {showAddressErrorSummary && (
                  <Alert severity="error">
                    {lang === "en" ? "Please fill in all required fields." : "נא למלא את כל השדות הנדרשים."}
                  </Alert>
                )}
                <LoadingButton
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  loading={submitting}
                  disabled={submitting || checkingShipping}
                  onClick={handleSubmit}
                >
                  {lang === "en" ? "Complete purchase" : "לתשלום"}
                </LoadingButton>
                <Box
                  component={RouterLink}
                  to={loc("/cart")}
                  sx={{ display: "block", textAlign: "center", color: "inherit", textDecoration: "underline", textUnderlineOffset: 4, fontSize: 14 }}
                >
                  {lang === "en" ? "Back to cart" : "חזרה לסל"}
                </Box>
              </>
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

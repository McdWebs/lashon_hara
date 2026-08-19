import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  ISRAELI_LOCALITIES,
  getLocalityLabel,
  type IsraeliLocality,
} from "../lib/israeliLocalities";
import { useLocale } from "../i18n/useLocale";

const filterLocalities = createFilterOptions<IsraeliLocality>({
  limit: 40,
  stringify: (option) => `${option.he} ${option.en ?? ""}`,
});

type CityAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  size?: "small" | "medium";
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
};

export function CityAutocomplete({
  label,
  name,
  required,
  size,
  value,
  onChange,
  onBlur,
  error,
  helperText,
}: CityAutocompleteProps) {
  const { lang } = useLocale();
  const selected = ISRAELI_LOCALITIES.find((locality) => locality.he === value) ?? null;

  return (
    <>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <Autocomplete
        options={ISRAELI_LOCALITIES}
        value={selected}
        onChange={(_, option) => onChange(option?.he ?? null)}
        onBlur={onBlur}
        getOptionLabel={(option) => getLocalityLabel(option, lang)}
        filterOptions={filterLocalities}
        isOptionEqualToValue={(a, b) => a.he === b.he}
        noOptionsText={lang === "en" ? "No matches" : "לא נמצאו תוצאות"}
        renderInput={(params) => (
          <TextField {...params} label={label} required={required} size={size} error={error} helperText={helperText} />
        )}
      />
    </>
  );
}

import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { WcAttribute, WcVariation } from "../lib/catalog";

export function VariationPicker({
  attributes,
  variations,
  onResolve,
}: {
  attributes: WcAttribute[];
  variations: WcVariation[];
  onResolve: (variationId: number | null) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const attr of attributes) {
      if (attr.terms.length === 1) initial[attr.name] = attr.terms[0].slug;
    }
    return initial;
  });

  const resolvedId = useMemo(() => {
    if (attributes.some((attr) => !selected[attr.name])) return null;
    const match = variations.find((variation) =>
      attributes.every((attr) => {
        const value = variation.attributes.find((a) => a.name === attr.name)?.value;
        return value === selected[attr.name];
      }),
    );
    return match?.id ?? null;
  }, [attributes, variations, selected]);

  useEffect(() => {
    onResolve(resolvedId);
  }, [resolvedId, onResolve]);

  return (
    <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
      {attributes.map((attr) => (
        <FormControl key={attr.id} size="small" sx={{ minWidth: 140 }}>
          <InputLabel id={`variation-attr-${attr.id}`}>{attr.name}</InputLabel>
          <Select
            labelId={`variation-attr-${attr.id}`}
            label={attr.name}
            value={selected[attr.name] ?? ""}
            onChange={(e) => setSelected((prev) => ({ ...prev, [attr.name]: e.target.value }))}
          >
            {attr.terms.map((term) => (
              <MenuItem key={term.id} value={term.slug}>
                {term.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Stack>
  );
}
